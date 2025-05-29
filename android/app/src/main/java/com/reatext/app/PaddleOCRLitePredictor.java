package com.reatext.app;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.util.Log;
import android.graphics.Canvas;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Paint;
import com.reatext.app.R;

import com.baidu.paddle.lite.*;

import java.io.*;
import java.util.*;

public class PaddleOCRLitePredictor {
    private Context context;
    private PaddlePredictor detPredictor;
    private PaddlePredictor clsPredictor;
    private PaddlePredictor recPredictor;
    private List<String> labelList;

    public PaddleOCRLitePredictor(Context context) {
        this.context = context;
    }

    public void initModels() {
        detPredictor = loadModelFromAssets("models/det/slim_det_mv3.nb");
        clsPredictor = loadModelFromAssets("models/cls/slim_cls_mv3.nb");
        recPredictor = loadModelFromAssets("models/rec/slim_rec_mv3.nb");
        labelList = loadLabelList("models/ppocr_keys_v1.txt");
    }

    private PaddlePredictor loadModelFromAssets(String modelPathInAssets) {
        try {
            String modelPath = copyAssetToCache(modelPathInAssets);
            MobileConfig config = new MobileConfig();
            config.setModelFromFile(modelPath);
            return PaddlePredictor.createPaddlePredictor(config);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private String copyAssetToCache(String fileName) throws IOException {
        File outFile = new File(context.getCacheDir(), fileName);
        if (outFile.exists()) return outFile.getAbsolutePath();

        InputStream is = context.getAssets().open(fileName);
        File outDir = outFile.getParentFile();
        if (!outDir.exists()) outDir.mkdirs();

        FileOutputStream os = new FileOutputStream(outFile);
        byte[] buffer = new byte[1024];
        int length;
        while ((length = is.read(buffer)) != -1) {
            os.write(buffer, 0, length);
        }
        os.flush(); os.close(); is.close();

        return outFile.getAbsolutePath();
    }

    private List<String> loadLabelList(String dictFile) {
        List<String> list = new ArrayList<>();
        try {
            InputStream is = context.getAssets().open(dictFile);
            BufferedReader br = new BufferedReader(new InputStreamReader(is));
            String line;
            while ((line = br.readLine()) != null) {
                list.add(line.trim());
            }
            br.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return list;
    }

    private float[] preprocess(Bitmap bitmap, int targetWidth, int targetHeight) {
        Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, targetWidth, targetHeight, false);

        int[] pixels = new int[targetWidth * targetHeight];
        resizedBitmap.getPixels(pixels, 0, targetWidth, 0, 0, targetWidth, targetHeight);

        float[] inputData = new float[3 * targetHeight * targetWidth]; // CHW
        int r, g, b;
        for (int y = 0; y < targetHeight; y++) {
            for (int x = 0; x < targetWidth; x++) {
                int index = y * targetWidth + x;
                int pixel = pixels[index];

                r = (pixel >> 16) & 0xff;
                g = (pixel >> 8) & 0xff;
                b = pixel & 0xff;

                inputData[0 * targetHeight * targetWidth + index] = r / 255.0f;
                inputData[1 * targetHeight * targetWidth + index] = g / 255.0f;
                inputData[2 * targetHeight * targetWidth + index] = b / 255.0f;
            }
        }

        return inputData;
    }

    public float[][] runDet(Bitmap bitmap) {
        int inputWidth = 640;
        int inputHeight = 640;
        float[] inputData = preprocess(bitmap, inputWidth, inputHeight);

        Tensor inputTensor = detPredictor.getInput(0);
        inputTensor.resize(new long[]{1, 3, inputHeight, inputWidth});
        inputTensor.setData(inputData);

        detPredictor.run();

        Tensor outputTensor = detPredictor.getOutput(0);
        float[] outputData = outputTensor.getFloatData();
        long[] outputShape = outputTensor.shape();

        Log.d("OCR", "DET output shape: " + Arrays.toString(outputShape));
        Log.d("OCR", "DET raw data sample: " + Arrays.toString(Arrays.copyOf(outputData, 10)));

        return new float[0][]; // 后处理暂未实现
    }

    public boolean runCls(Bitmap bitmap) {
        int inputHeight = 48;
        int inputWidth = 192;

        float[] inputData = preprocess(bitmap, inputWidth, inputHeight);

        Tensor inputTensor = clsPredictor.getInput(0);
        inputTensor.resize(new long[]{1, 3, inputHeight, inputWidth});
        inputTensor.setData(inputData);

        clsPredictor.run();

        Tensor outputTensor = clsPredictor.getOutput(0);
        float[] output = outputTensor.getFloatData(); // [1, 2]

        return output[1] > output[0]; // index 1 是需要旋转的概率
    }

    public String runRec(Bitmap bitmap) {
        int targetHeight = 32;
        int originalWidth = bitmap.getWidth();
        int originalHeight = bitmap.getHeight();
        int targetWidth = Math.max(32, Math.min(320, (int) (((float) originalWidth / originalHeight) * targetHeight)));

        float[] inputData = preprocess(bitmap, targetWidth, targetHeight);

        Tensor inputTensor = recPredictor.getInput(0);
        inputTensor.resize(new long[]{1, 3, targetHeight, targetWidth});
        inputTensor.setData(inputData);

        recPredictor.run();

        Tensor outputTensor = recPredictor.getOutput(0);
        float[] outputData = outputTensor.getFloatData();
        long[] shape = outputTensor.shape(); // [1, seq_len, dict_size]
        int seq_len = (int) shape[1];
        int dict_size = (int) shape[2];

        StringBuilder sb = new StringBuilder();
        int last_index = -1;

        for (int i = 0; i < seq_len; i++) {
            float maxScore = -Float.MAX_VALUE;
            int maxIndex = -1;
            for (int j = 0; j < dict_size; j++) {
                float score = outputData[i * dict_size + j];
                if (score > maxScore) {
                    maxScore = score;
                    maxIndex = j;
                }
            }

            if (maxIndex != last_index && maxIndex < labelList.size()) {
                String c = labelList.get(maxIndex);
                sb.append(c);
                last_index = maxIndex;
            }
        }

        return sb.toString();
    }

    public List<String> runOcr(Bitmap bitmap) {
    List<String> resultList = new ArrayList<>();

    Log.d("OCR", "开始预处理 → 方向判断 → 识别...");

    // 1. 灰度化图像（可提升对比度）
    Bitmap subBitmap = toGrayscale(bitmap);

    // 2. 方向分类（是否旋转 180°）
    boolean rotated = runCls(subBitmap);
    if (rotated) {
        Matrix matrix = new Matrix();
        matrix.postRotate(180);
        subBitmap = Bitmap.createBitmap(subBitmap, 0, 0, subBitmap.getWidth(), subBitmap.getHeight(), matrix, true);
    }

    // 3. 文本识别
    String text = runRec(subBitmap);
    resultList.add(text);

    return resultList;
}

public Bitmap toGrayscale(Bitmap bmpOriginal) {
    int width = bmpOriginal.getWidth();
    int height = bmpOriginal.getHeight();
    Bitmap bmpGrayscale = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
    Canvas canvas = new Canvas(bmpGrayscale);
    Paint paint = new Paint();
    ColorMatrix cm = new ColorMatrix();
    cm.setSaturation(0); // 去除彩色
    ColorMatrixColorFilter f = new ColorMatrixColorFilter(cm);
    paint.setColorFilter(f);
    canvas.drawBitmap(bmpOriginal, 0, 0, paint);
    return bmpGrayscale;
}

}
