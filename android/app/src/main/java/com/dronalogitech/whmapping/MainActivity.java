package com.dronalogitech.whmapping;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        
        // Get the WebView and configure it for better Android 11 compatibility
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            
            // Enable DOM storage (required for localStorage)
            settings.setDomStorageEnabled(true);
            
            // Enable caching for better CSS/JS loading
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setDatabaseEnabled(true);
            
            // Allow file access
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            
            // Enable JavaScript
            settings.setJavaScriptEnabled(true);
            
            // Mixed content mode for Android 11
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            
            // Force hardware acceleration
            webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        }
    }
}
