package com.reatext.app;

import android.app.Activity;
import android.content.Intent;
import android.media.projection.MediaProjectionManager;
import android.os.Bundle;
import android.util.Log;
import com.reatext.app.R;

public class ScreenCapturePermissionActivity extends Activity {
    private static final int REQUEST_MEDIA_PROJECTION = 1001;
    private static final String TAG = "ScreenCapturePermission";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "Requesting screen capture permission...");

        MediaProjectionManager mpm = (MediaProjectionManager) getSystemService(MEDIA_PROJECTION_SERVICE);
        Intent permissionIntent = mpm.createScreenCaptureIntent();
        startActivityForResult(permissionIntent, REQUEST_MEDIA_PROJECTION);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        Log.d(TAG, "onActivityResult triggered");

        if (requestCode == REQUEST_MEDIA_PROJECTION) {
            Intent intent = new Intent("com.alexcheng.heybossapp.SCREENSHOT_PERMISSION");
            intent.putExtra("resultCode", resultCode);
            intent.putExtra("data", data);
            sendBroadcast(intent);

            Log.d(TAG, "Broadcast sent with resultCode: " + resultCode + ", data: " + (data != null));
        }

        finish();
    }
}
