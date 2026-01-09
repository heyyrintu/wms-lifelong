package com.dronalogitech.whmapping;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Configure WebView immediately
        configureWebView();
    }
    
    private void configureWebView() {
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            
            // Enable DOM storage (required for localStorage)
            settings.setDomStorageEnabled(true);
            
            // Database storage
            settings.setDatabaseEnabled(true);
            
            // JavaScript enabled
            settings.setJavaScriptEnabled(true);
            
            // Allow file access
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            
            // Cache mode
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            
            // Mixed content mode for HTTPS
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            
            // Load images automatically
            settings.setLoadsImagesAutomatically(true);
            settings.setBlockNetworkImage(false);
            settings.setBlockNetworkLoads(false);
            
            // Enable wide viewport
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            
            // Media playback
            settings.setMediaPlaybackRequiresUserGesture(false);
            
            // Enable zoom controls (may help with some devices)
            settings.setSupportZoom(true);
            settings.setBuiltInZoomControls(true);
            settings.setDisplayZoomControls(false);
            
            // Set user agent to include mobile
            String userAgent = settings.getUserAgentString();
            settings.setUserAgentString(userAgent + " CapacitorApp");
            
            // Force hardware acceleration
            webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
            
            // Clear cache on first run to ensure fresh CSS load
            webView.clearCache(true);
            webView.clearHistory();
            
            // Set WebViewClient to handle resource loading
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    return false;
                }
                
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    // Let all requests through normally
                    return super.shouldInterceptRequest(view, request);
                }
            });
        }
    }
}
