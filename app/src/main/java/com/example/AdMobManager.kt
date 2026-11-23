package com.example

import android.app.Activity
import android.content.Context
import android.util.Log
import android.view.ViewGroup
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback

class AdMobManager(private val appContext: Context) {

  @Volatile
  private var interstitialAd: InterstitialAd? = null

  @Volatile
  private var isLoadingInterstitial = false

  @Volatile
  private var isShowingInterstitial = false

  fun initialize() {
    try {
      MobileAds.initialize(appContext) {
        loadInterstitial()
      }
    } catch (e: Exception) {
      Log.w("HeartShayriAds", "MobileAds initialization skipped", e)
    }
  }

  fun loadInterstitial() {
    if (isLoadingInterstitial || interstitialAd != null) return
    isLoadingInterstitial = true

    val adUnitId = appContext.getString(R.string.admob_interstitial_id)
    val adRequest = AdRequest.Builder().build()

    InterstitialAd.load(
      appContext,
      adUnitId,
      adRequest,
      object : InterstitialAdLoadCallback() {
        override fun onAdLoaded(ad: InterstitialAd) {
          isLoadingInterstitial = false
          interstitialAd = ad
        }

        override fun onAdFailedToLoad(loadAdError: LoadAdError) {
          isLoadingInterstitial = false
          interstitialAd = null
          Log.w("HeartShayriAds", "Interstitial failed to load: ${loadAdError.message}")
        }
      },
    )
  }

  fun showInterstitial(activity: Activity) {
    activity.runOnUiThread {
      if (activity.isFinishing || activity.isDestroyed) return@runOnUiThread
      if (isShowingInterstitial) return@runOnUiThread

      val currentAd = interstitialAd
      if (currentAd == null) {
        loadInterstitial()
        return@runOnUiThread
      }

      isShowingInterstitial = true
      currentAd.fullScreenContentCallback = object : FullScreenContentCallback() {
        override fun onAdDismissedFullScreenContent() {
          isShowingInterstitial = false
          interstitialAd = null
          loadInterstitial()
        }

        override fun onAdFailedToShowFullScreenContent(adError: AdError) {
          isShowingInterstitial = false
          interstitialAd = null
          loadInterstitial()
        }
      }
      currentAd.show(activity)
    }
  }
}

@Composable
fun AdMobBannerBar(modifier: Modifier = Modifier) {
  val context = LocalContext.current
  val bannerAdUnitId = remember(context) { context.getString(R.string.admob_banner_id) }

  BoxWithConstraints(
    modifier = modifier
      .fillMaxWidth()
      .background(Color.Black)
      .testTag("admob_banner_container"),
    contentAlignment = Alignment.Center,
  ) {
    val adWidthDp = maxWidth.value.toInt().coerceAtLeast(320)
    val adView = remember(context, adWidthDp) {
      AdView(context).apply {
        adUnitId = bannerAdUnitId
        setAdSize(
          AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(context, adWidthDp)
        )
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.WRAP_CONTENT,
        )
        adListener = object : AdListener() {
          override fun onAdFailedToLoad(error: LoadAdError) {
            Log.w("HeartShayriAds", "Banner failed to load: ${error.message}")
          }
        }
        loadAd(AdRequest.Builder().build())
      }
    }

    DisposableEffect(adView) {
      onDispose {
        adView.destroy()
      }
    }

    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
      AndroidView(
        modifier = Modifier.fillMaxWidth(),
        factory = { adView },
      )
    }
  }
}
