package com.reatext.app;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.PixelFormat;
import android.graphics.Point;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.Image;
import android.media.ImageReader;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Toast;
import com.reatext.app.R;

import androidx.core.app.NotificationCompat;

import java.nio.ByteBuffer;
import java.util.List;

public class FloatingBallService extends Service {
    private static final String CHANNEL_ID = "floating_ball_service";

    private WindowManager windowManager;
    private View floatingView;
    private BroadcastReceiver permissionReceiver;

    private MediaProjectionManager projectionManager;
    private MediaProjection mediaProjection;
    private ImageReader imageReader;
    private VirtualDisplay virtualDisplay;
    private Handler handler;

    private boolean hasPermissionGranted = false;

@Override
public void onCreate() {
    super.onCreate();

    // —— ① Android M+ 悬浮窗权限检查 ——
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
            && !Settings.canDrawOverlays(this)) {
        Intent intent = new Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:" + getPackageName())
        );
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        stopSelf();  // 权限未给，不继续加载悬浮球
        return;
    }

    // —— ② 权限 OK，启动前台 Service 通知 ——
    startForegroundServiceWithNotification();

    // —— ③ 初始化悬浮球（暂时禁用，整段注释保留） ——

    /*
    windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
    projectionManager = (MediaProjectionManager) getSystemService(MEDIA_PROJECTION_SERVICE);
    handler = new Handler(Looper.getMainLooper());

    LayoutInflater inflater = LayoutInflater.from(this);
    floatingView = inflater.inflate(R.layout.floating_ball_layout, null);

    int layoutFlag = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            : WindowManager.LayoutParams.TYPE_PHONE;

    final WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
    );
    params.gravity = Gravity.TOP | Gravity.START;
    params.x = 100;
    params.y = 200;
    windowManager.addView(floatingView, params);

    floatingView.setOnTouchListener(new View.OnTouchListener() {
        private int lastX, lastY;
        private int screenWidth, screenHeight;
        private long lastTouchDown;

        @Override
        public boolean onTouch(View v, MotionEvent event) {
            if (screenWidth == 0) {
                Point size = new Point();
                windowManager.getDefaultDisplay().getSize(size);
                screenWidth = size.x;
                screenHeight = size.y;
            }
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    lastX = (int) event.getRawX();
                    lastY = (int) event.getRawY();
                    lastTouchDown = System.currentTimeMillis();
                    return true;
                case MotionEvent.ACTION_MOVE:
                    int dx = (int) event.getRawX() - lastX;
                    int dy = (int) event.getRawY() - lastY;
                    params.x += dx;
                    params.y += dy;
                    windowManager.updateViewLayout(floatingView, params);
                    lastX = (int) event.getRawX();
                    lastY = (int) event.getRawY();
                    return true;
                case MotionEvent.ACTION_UP:
                    long elapsed = System.currentTimeMillis() - lastTouchDown;
                    if (elapsed < 200) {
                        if (hasPermissionGranted && mediaProjection != null) {
                            startScreenshot();
                        } else {
                            Intent captureIntent = new Intent(
                                FloatingBallService.this,
                                ScreenCapturePermissionActivity.class
                            );
                            captureIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(captureIntent);

                            if (permissionReceiver == null) {
                                permissionReceiver = new BroadcastReceiver() {
                                    @Override
                                    public void onReceive(Context context, Intent intent) {
                                        int resultCode = intent.getIntExtra(
                                            "resultCode",
                                            Activity.RESULT_CANCELED
                                        );
                                        Intent data = intent.getParcelableExtra("data");
                                        if (resultCode == Activity.RESULT_OK && data != null) {
                                            mediaProjection = projectionManager
                                                .getMediaProjection(resultCode, data);
                                            hasPermissionGranted = true;
                                            startScreenshot();
                                        } else {
                                            Toast.makeText(
                                                FloatingBallService.this,
                                                "授权失败，无法截图",
                                                Toast.LENGTH_SHORT
                                            ).show();
                                        }
                                    }
                                };
                                IntentFilter filter = new IntentFilter(
                                    "com.alexcheng.heybossapp.SCREENSHOT_PERMISSION"
                                );
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                    registerReceiver(
                                        permissionReceiver,
                                        filter,
                                        Context.RECEIVER_NOT_EXPORTED
                                    );
                                } else {
                                    registerReceiver(permissionReceiver, filter);
                                }
                            }
                        }
                    }
                    return true;
                default:
                    return false;
            }
        }
    });
    */
}

    /** 启动前台服务所需的通知 */
    private void startForegroundServiceWithNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "悬浮球服务",
                    NotificationManager.IMPORTANCE_MIN
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle("SnapText 悬浮球运行中")
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setOngoing(true)
                    .build();

            startForeground(1, notification);
        }
    }

    private void startScreenshot() {
        DisplayMetrics metrics = getResources().getDisplayMetrics();
        int width = metrics.widthPixels;
        int height = metrics.heightPixels;
        int density = metrics.densityDpi;

        imageReader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 1);
        virtualDisplay = mediaProjection.createVirtualDisplay(
                "ScreenCapture",
                width, height, density,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                imageReader.getSurface(), null, handler
        );

        handler.postDelayed(() -> {
            Image image = imageReader.acquireLatestImage();
            if (image != null) {
                ByteBuffer buffer = image.getPlanes()[0].getBuffer();
                int pixelStride = image.getPlanes()[0].getPixelStride();
                int rowStride = image.getPlanes()[0].getRowStride();
                int rowPadding = rowStride - pixelStride * width;

                Bitmap bitmap = Bitmap.createBitmap(
                        width + rowPadding / pixelStride,
                        height,
                        Bitmap.Config.ARGB_8888
                );
                bitmap.copyPixelsFromBuffer(buffer);
                image.close();
                performOCR(bitmap);
            } else {
                Toast.makeText(this, "截图失败，请再试一次", Toast.LENGTH_SHORT).show();
            }
        }, 500);
    }

    private void performOCR(Bitmap bitmap) {
        PaddleOCRLitePredictor predictor = new PaddleOCRLitePredictor(getApplicationContext());
        predictor.initModels();
        List<String> result = predictor.runOcr(bitmap);

        String text = result.isEmpty() ? "未识别到文字" : result.get(0);
        Toast.makeText(this, "识别结果: " + text, Toast.LENGTH_LONG).show();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (floatingView != null) windowManager.removeView(floatingView);
        if (permissionReceiver != null) unregisterReceiver(permissionReceiver);
        if (mediaProjection != null) mediaProjection.stop();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
