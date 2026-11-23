package com.example

import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipboardManager
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Color as AndroidColor
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.util.Log
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.ValueCallback
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import com.example.ui.theme.HeartShayriTheme
import java.io.File
import java.io.FileOutputStream

import android.app.Activity
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth

class MainActivity : ComponentActivity() {

  private lateinit var adMobManager: AdMobManager

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    adMobManager = AdMobManager(applicationContext).apply { initialize() }

    enableEdgeToEdge(
      statusBarStyle = SystemBarStyle.dark(AndroidColor.BLACK),
      navigationBarStyle = SystemBarStyle.dark(AndroidColor.BLACK),
    )

    setContent {
      HeartShayriTheme {
        Scaffold(
          modifier = Modifier.fillMaxSize(),
          containerColor = Color.Black,
          contentWindowInsets = WindowInsets.safeDrawing,
        ) { innerPadding ->
          Column(
            modifier = Modifier
              .fillMaxSize()
              .background(Color.Black)
              .padding(innerPadding)
          ) {
            Box(
              modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
            ) {
              HeartShayriWebView(
                activity = this@MainActivity,
                adMobManager = adMobManager,
                onExitApp = { finish() },
              )
            }
            AdMobBannerBar(modifier = Modifier.fillMaxWidth())
          }
        }
      }
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun HeartShayriWebView(
  activity: Activity,
  adMobManager: AdMobManager,
  onExitApp: () -> Unit,
) {
  val context = LocalContext.current
  var webViewRef by remember { mutableStateOf<WebView?>(null) }
  var pendingFileCallback by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }

  // Zero-permission Android Photo Picker for Canvas Gallery Background upload
  val photoPickerLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri: Uri? ->
    val callback = pendingFileCallback
    pendingFileCallback = null
    if (callback != null) {
      if (uri != null) {
        callback.onReceiveValue(arrayOf(uri))
      } else {
        callback.onReceiveValue(null)
      }
    }
  }

  // Handle hardware/gesture back button via JS tab/modal stack first
  BackHandler {
    val wv = webViewRef
    if (wv != null) {
      wv.evaluateJavascript("window.handleAndroidBack && window.handleAndroidBack()") { result ->
        if (result != "true") {
          onExitApp()
        }
      }
    } else {
      onExitApp()
    }
  }

  DisposableEffect(Unit) {
    onDispose {
      pendingFileCallback?.onReceiveValue(null)
      pendingFileCallback = null
      webViewRef?.destroy()
      webViewRef = null
    }
  }

  val assetLoader = remember(context) {
    WebViewAssetLoader.Builder()
      .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
      .build()
  }

  AndroidView(
    modifier = Modifier
      .fillMaxSize()
      .testTag("heart_shayri_webview"),
    factory = { ctx ->
      WebView(ctx).apply {
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT,
        )
        setBackgroundColor(AndroidColor.BLACK)
        overScrollMode = WebView.OVER_SCROLL_NEVER

        settings.apply {
          javaScriptEnabled = true
          domStorageEnabled = true
          databaseEnabled = true
          allowFileAccess = false
          allowContentAccess = true
          mediaPlaybackRequiresUserGesture = false
          useWideViewPort = true
          loadWithOverviewMode = true
          cacheMode = WebSettings.LOAD_DEFAULT
        }

        addJavascriptInterface(
          HeartShayriBridge(activity, adMobManager),
          "AndroidBridge",
        )

        webViewClient = object : WebViewClient() {
          override fun shouldInterceptRequest(
            view: WebView,
            request: WebResourceRequest,
          ): WebResourceResponse? {
            return assetLoader.shouldInterceptRequest(request.url)
          }

          override fun shouldOverrideUrlLoading(
            view: WebView,
            request: WebResourceRequest,
          ): Boolean {
            val url = request.url.toString()
            if (url.startsWith("https://appassets.androidplatform.net/")) {
              return false
            }
            openExternalUri(ctx, url)
            return true
          }
        }

        webChromeClient = object : WebChromeClient() {
          override fun onShowFileChooser(
            webView: WebView?,
            filePathCallback: ValueCallback<Array<Uri>>?,
            fileChooserParams: FileChooserParams?,
          ): Boolean {
            pendingFileCallback?.onReceiveValue(null)
            pendingFileCallback = filePathCallback
            photoPickerLauncher.launch(
              PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
            )
            return true
          }
        }

        loadUrl("https://appassets.androidplatform.net/assets/index.html")
        webViewRef = this
      }
    },
  )
}

private fun openExternalUri(context: Context, url: String) {
  try {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    context.startActivity(intent)
  } catch (e: Exception) {
    Log.w("HeartShayri", "Unable to open URL: $url", e)
    Toast.makeText(context, "No app found to open link", Toast.LENGTH_SHORT).show()
  }
}

class HeartShayriBridge(
  private val activity: Activity,
  private val adMobManager: AdMobManager,
) {

  private val context: Context = activity.applicationContext

  @JavascriptInterface
  fun copyText(text: String) {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
    clipboard?.setPrimaryClip(ClipData.newPlainText("Heart Shayri", text))
  }

  @JavascriptInterface
  fun openExternalUrl(url: String) {
    openExternalUri(context, url)
  }

  @JavascriptInterface
  fun showInterstitial() {
    adMobManager.showInterstitial(activity)
  }

  @JavascriptInterface
  fun saveBase64Image(dataUrl: String, filename: String) {
    try {
      val pngBytes = decodeDataUrl(dataUrl) ?: return
      val safeName = filename.replace(Regex("[^a-zA-Z0-9._-]"), "_")
      val resolver = context.contentResolver

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        val values = ContentValues().apply {
          put(MediaStore.Images.Media.DISPLAY_NAME, safeName)
          put(MediaStore.Images.Media.MIME_TYPE, "image/png")
          put(MediaStore.Images.Media.RELATIVE_PATH, "${Environment.DIRECTORY_PICTURES}/Heart Shayri")
          put(MediaStore.Images.Media.IS_PENDING, 1)
        }
        val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values) ?: return
        resolver.openOutputStream(uri)?.use { out ->
          out.write(pngBytes)
        }
        values.clear()
        values.put(MediaStore.Images.Media.IS_PENDING, 0)
        resolver.update(uri, values, null, null)
      } else {
        val dir = File(
          context.getExternalFilesDir(Environment.DIRECTORY_PICTURES),
          "HeartShayri",
        )
        if (!dir.exists()) dir.mkdirs()
        val file = File(dir, safeName)
        FileOutputStream(file).use { it.write(pngBytes) }
      }
    } catch (e: Exception) {
      Log.e("HeartShayri", "Failed saving status image", e)
    }
  }

  @JavascriptInterface
  fun shareImageAndText(dataUrl: String, text: String, filename: String) {
    try {
      val pngBytes = decodeDataUrl(dataUrl) ?: return
      val safeName = filename.replace(Regex("[^a-zA-Z0-9._-]"), "_")
      val shareDir = File(context.cacheDir, "shared_images").apply {
        if (!exists()) mkdirs()
      }
      val outFile = File(shareDir, safeName)
      FileOutputStream(outFile).use { it.write(pngBytes) }

      val contentUri = FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        outFile,
      )

      val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "image/png"
        putExtra(Intent.EXTRA_STREAM, contentUri)
        putExtra(Intent.EXTRA_TEXT, text)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }

      val chooser = Intent.createChooser(shareIntent, "Share Shayari Status").apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(chooser)
    } catch (e: Exception) {
      Log.e("HeartShayri", "Failed sharing status image", e)
    }
  }

  private fun decodeDataUrl(dataUrl: String): ByteArray? {
    val commaIdx = dataUrl.indexOf(',')
    val base64Part = if (commaIdx >= 0) dataUrl.substring(commaIdx + 1) else dataUrl
    return Base64.decode(base64Part, Base64.DEFAULT)
  }
}
