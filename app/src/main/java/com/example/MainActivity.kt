package com.example

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
    private var mainWebView: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .safeDrawingPadding(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    TaghvimSinaWebView(
                        onWebViewCreated = { webView ->
                            mainWebView = webView
                        }
                    )
                }
            }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (mainWebView?.canGoBack() == true) {
            mainWebView?.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun TaghvimSinaWebView(onWebViewCreated: (WebView) -> Unit) {
    AndroidView(
        factory = { context ->
            WebView(context).apply {
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    databaseEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                    loadWithOverviewMode = true
                    useWideViewPort = true
                    cacheMode = WebSettings.LOAD_DEFAULT
                    userAgentString = userAgentString + " ATCCalendarAPK/1.1.2"
                }
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView, url: String) {
                        super.onPageFinished(view, url)
                        // Hide only advertising-carousel pagination dots. Calendar event/note dots remain untouched.
                        val hideAdPagination = """
                            (function() {
                              const styleId = 'atc-hide-ad-pagination-dots';
                              const css = [
                                '.ad-dots', '.ad-indicators', '.ad-pagination',
                                '.ad-slider-dots', '.ad-carousel-dots',
                                '.ad-carousel-indicators', '.ad-carousel-pagination',
                                '.banner-dots', '.banner-indicators', '.banner-pagination',
                                '[id*="ad" i] .dots', '[class*="ad" i] .dots',
                                '[id*="banner" i] .dots', '[class*="banner" i] .dots',
                                '[id*="ad" i] [class*="dot" i]',
                                '[class*="ad" i] [class*="dot" i]',
                                '[id*="banner" i] [class*="dot" i]',
                                '[class*="banner" i] [class*="dot" i]',
                                '[id*="ad" i] .carousel-indicators',
                                '[class*="ad" i] .carousel-indicators',
                                '[id*="banner" i] .carousel-indicators',
                                '[class*="banner" i] .carousel-indicators',
                                '[id*="ad" i] .swiper-pagination',
                                '[class*="ad" i] .swiper-pagination',
                                '[id*="banner" i] .swiper-pagination',
                                '[class*="banner" i] .swiper-pagination'
                              ].join(',') + '{display:none!important;visibility:hidden!important;opacity:0!important;height:0!important;pointer-events:none!important}';
                              function apply() {
                                if (!document.getElementById(styleId)) {
                                  const style = document.createElement('style');
                                  style.id = styleId;
                                  style.textContent = css;
                                  (document.head || document.documentElement).appendChild(style);
                                }
                              }
                              apply();
                              if (!window.__atcAdDotsObserver) {
                                window.__atcAdDotsObserver = new MutationObserver(apply);
                                window.__atcAdDotsObserver.observe(document.documentElement, {childList:true,subtree:true});
                              }
                            })();
                        """.trimIndent()
                        view.evaluateJavascript(hideAdPagination, null)
                    }
                }
                webChromeClient = WebChromeClient()
                loadUrl("https://sina5489.github.io/ATC-Calendar-/calendar/")
                onWebViewCreated(this)
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}
