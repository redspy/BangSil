package com.kwconsil.bansilmotelapp;

import java.util.Locale;
import java.util.UUID;

import com.google.android.gcm.GCMRegistrar;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.telephony.PhoneNumberUtils;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

/**
 * An example full-screen activity that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 * 
 * @see SystemUiHider
 */

@SuppressLint("SetJavaScriptEnabled")
public class FullscreenActivity extends Activity 
{
	//protected static final String HOST = "http://192.168.1.2:8080/motelApp";
	protected static final String HOST_REQUEST = "http://222.122.143.163/motelApp/#/request";
	protected static final String HOST_APROVAL = "http://222.122.143.163/motelApp/#/approval";
	protected static final String HOST = "http://222.122.143.163/motelApp";
	//protected static final String HOST = "http://utoxiz.iptime.org:8080/motelApp";
	protected static final String APP_TYPE = "motel";
	protected static final String PROJECT_ID = "804890966730";
	
	private final class SessionBridge {
		@JavascriptInterface
		public void register() {
			mHandler.post(new Runnable(){
				public void run(){
					mWebView.loadUrl("javascript:localStorage.setItem('PhoneNumber', '" + phoneNumber + "')");
					mWebView.loadUrl("javascript:localStorage.setItem('AppKey', '" + appKey + "')");
					mWebView.loadUrl("javascript:localStorage.setItem('AppType', '" + appType + "')");
					mWebView.loadUrl("javascript:localStorage.setItem('GCMID', '" + gcmId + "')");
				}
			});
		}
	}

	private WebView mWebView;
	private String appKey;
	private String gcmId;
	private String phoneNumber;
	private String appType;
	
	// 핸들러, 플래그
	private static Handler mHandler = new Handler() {
		@Override
		public void handleMessage(android.os.Message msg) {
			if(msg.what == 0) {
				mFlag = false;
			}
		}
	};
	private static boolean mFlag = false;

	@SuppressLint("JavascriptInterface") @TargetApi(Build.VERSION_CODES.KITKAT)
	@Override
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		
		SharedPreferences prefs = getSharedPreferences("appConfig", MODE_PRIVATE);
		appKey = prefs.getString("appKey", "");
		if (appKey.isEmpty())
		{
			appKey = UUID.randomUUID().toString().toUpperCase(Locale.US);
			SharedPreferences.Editor editor = prefs.edit();
			editor.putString("appKey", appKey);
			editor.commit();
		}
		
		SharedPreferences.Editor editor = prefs.edit();
		editor.putString("appKey", appKey.toUpperCase(Locale.US));
		editor.commit();
		
		appKey = prefs.getString("appKey", "");
		
		// session data
		phoneNumber = GetMyPhoneNumber();
		appType = APP_TYPE;
		gcmId = registerGcm();
		
		setContentView(R.layout.activity_fullscreen);
		setLayout();
		
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT)
		{
			WebView.setWebContentsDebuggingEnabled(true);
		}
		
		mWebView.getSettings().setJavaScriptEnabled(true);
		mWebView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
		mWebView.getSettings().setGeolocationEnabled(true);
		mWebView.getSettings().setDomStorageEnabled(true);
		
		mWebView.clearHistory();
		mWebView.clearCache(true);
				
		mWebView.setWebViewClient(new WebViewClient() 
		{						
			public boolean shouldOverrideUrlLoading(WebView view, String url) 
			{
				if (url.startsWith("tel:")) 
				{ 
					Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse(url)); 
					startActivity(intent); 
				}
				else if(url.startsWith("http:") || url.startsWith("https:")) 
				{
				    view.loadUrl(url);
				}
				return true;
			}
		});
		mWebView.addJavascriptInterface(new SessionBridge(), "SessionBridge");
		Intent intent = this.getIntent();
		if (!CheckExtraString(intent))
		{
			mWebView.loadUrl(HOST);
		}
	}
	
	@Override
	protected void onNewIntent(Intent intent) {
	    super.onNewIntent(intent);

		if (!CheckExtraString(intent))
		{
			mWebView.loadUrl(HOST);
		}
	}
	
	private boolean CheckExtraString(Intent intent)
	{
		if (intent != null)
		{
			if (intent.getExtras() != null)
			{
				String messageString = intent.getExtras().getString("key");
				if (messageString.contains("새로운 요청"))
				{
					mWebView.loadUrl(HOST_REQUEST);
					return true;
				}
				else if (messageString.contains("사용자가 예약"))
				{
					mWebView.loadUrl(HOST_APROVAL);
					return true;
				}
				return true;
			}
		}
		
		return false;
	}

	public boolean onKeyDown(int keyCode, KeyEvent event) {
	    // 백 키를 터치한 경우
	    if(keyCode == KeyEvent.KEYCODE_BACK){
	        // 이전 페이지를 볼 수 있다면 이전 페이지를 보여줌
	        /*
	    	if(mWebView.canGoBack()){
	        	mWebView.goBack();	        	
	            return false;
	        }
	        */ 
	        // 이전 페이지를 볼 수 없다면 백키를 한번 더 터치해서 종료
	        //else {
	            if(!mFlag) {
	                Toast.makeText(this, "'뒤로' 버튼을 한번 더 누르시면 종료됩니다.", Toast.LENGTH_SHORT).show();
	                mFlag = true;
	                mHandler.sendEmptyMessageDelayed(0, 2000); // 2초 내로 터치시 
	                return false;
	            } else {
	                finish();
	            }
	        //}
	    }
	    return super.onKeyDown(keyCode, event);
	    
	}
	
	// You need to do the Play Services APK check here too.
	@Override
	protected void onResume() {
		//mWebView.clearHistory();
		//mWebView.clearCache(true);
		//mWebView.reload();
	    super.onResume();
	    //checkPlayServices();
	}

	/**
	 * Check the device to make sure it has the Google Play Services APK. If
	 * it doesn't, display a dialog that allows users to download the APK from
	 * the Google Play Store or enable it in the device's system settings.
	 */

	@SuppressWarnings("deprecation")
	private String GetMyPhoneNumber()
	{
		TelephonyManager systemService = (TelephonyManager)getSystemService(Context.TELEPHONY_SERVICE);

		String PhoneNumber = systemService.getLine1Number();

		try
		{
			PhoneNumber = PhoneNumber.substring(PhoneNumber.length()-10,PhoneNumber.length());
		}
		catch(Exception ex)
		{
			PhoneNumber = "";
		}
		
		PhoneNumber="0"+PhoneNumber;
		
		PhoneNumber = PhoneNumberUtils.formatNumber(PhoneNumber);
		
		return PhoneNumber;
	}
	
	public String registerGcm() 
	{
		GCMRegistrar.checkDevice(this);
		GCMRegistrar.checkManifest(this);
		 
		String regId = GCMRegistrar.getRegistrationId(this);
		 
		if (regId.equals("")) {
			GCMRegistrar.unregister(this);
			GCMRegistrar.register(this, PROJECT_ID);
			regId = GCMRegistrar.getRegistrationId(this);
		}
		
		Log.e("reg_id", GCMRegistrar.getRegistrationId(this));
		
		return regId;
	}
	
	private void setLayout(){
		mWebView = (WebView) findViewById(R.id.webView1);
	}

	/*
	private class WebViewClientClass extends WebViewClient { 
		@Override
		public boolean shouldOverrideUrlLoading(WebView view, String url) {  
			String origin_url = url;
			String temp_url = origin_url.substring(origin_url.length() - 3,
					origin_url.length());

			if (temp_url.equals("mp4")) {				
				// 동영상 플레이어로 재생하기 
				Intent i = new Intent(Intent.ACTION_VIEW);
				Uri uri = Uri.parse(url);
				i.setDataAndType(uri, "video/mp4");
				startActivity(i);
			} else if (origin_url.startsWith("tel:")) {

				// 전화 걸기 

				Intent call_phone = new Intent(Intent.ACTION_VIEW,
						Uri.parse(origin_url));
				// 현재의 activity 에 대해 startActivity 호출
				startActivity(call_phone);
				return true;

			} else if (origin_url.startsWith("mailto:")) {				
				// 이메일 보내기 				
				String email = origin_url.replace("mailto:", "");
				final Intent intent = new Intent(
						android.content.Intent.ACTION_SEND);
				intent.setType("plain/text");
				intent.putExtra(android.content.Intent.EXTRA_EMAIL,
						new String[] { email });
				intent.putExtra(android.content.Intent.EXTRA_SUBJECT, "제목");
				intent.putExtra(android.content.Intent.EXTRA_TEXT, "내용");
				startActivity(Intent.createChooser(intent, "이메일 전송"));

			} else {				
				// 기본 웹 페이지 넘어가기 				
				view.loadUrl(url);
			}
			return true;
		}
	}
*/	
}


