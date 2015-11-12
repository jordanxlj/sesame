

package com.xch.stockermaster;

import android.app.TabActivity;
import android.content.Intent;
import android.os.Bundle;
import android.view.Window;
import android.widget.CompoundButton;
import android.widget.RadioButton;
import android.widget.CompoundButton.OnCheckedChangeListener;
import android.widget.TabHost;

public class MainActivity extends TabActivity implements OnCheckedChangeListener{
	
	private TabHost mTabHost;
	private Intent mHomeIntent;
	private Intent mUsrIntent;
	
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.activity_main);
        
        this.mHomeIntent = new Intent(this,HomeActivity.class);
        this.mUsrIntent = new Intent(this,UsrActivity.class);
        //this.mCIntent = new Intent(this,CActivity.class);
        //this.mDIntent = new Intent(this,DActivity.class);
        //this.mEIntent = new Intent(this,EActivity.class);
        
		((RadioButton) findViewById(R.id.radio_home))
		.setOnCheckedChangeListener(this);
        ((RadioButton) findViewById(R.id.radio_usr))
		.setOnCheckedChangeListener(this);
        //((RadioButton) findViewById(R.id.radio_button2))
		//.setOnCheckedChangeListener(this);
        //((RadioButton) findViewById(R.id.radio_button3))
		//.setOnCheckedChangeListener(this);
        //((RadioButton) findViewById(R.id.radio_button4))
		//.setOnCheckedChangeListener(this);
        
        setupIntent();
    }

	@Override
	public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
		if(isChecked){
			switch (buttonView.getId()) {
			case R.id.radio_home:
				this.mTabHost.setCurrentTabByTag("activator_home");
				break;
			case R.id.radio_usr:
				this.mTabHost.setCurrentTabByTag("activator_usr");
				break;
			//case R.id.radio_button2:
			//	this.mTabHost.setCurrentTabByTag("C_TAB");
			//	break;
			//case R.id.radio_button3:
			//	this.mTabHost.setCurrentTabByTag("D_TAB");
			//	break;
			//case R.id.radio_button4:
			//	this.mTabHost.setCurrentTabByTag("MORE_TAB");
			//	break;
			}
		}
		
	}
	
	private void setupIntent() {
		this.mTabHost = getTabHost();
		TabHost localTabHost = this.mTabHost;

		localTabHost.addTab(buildTabSpec("activator_home", R.string.main_home,
				R.drawable.icon_home, this.mHomeIntent));

		localTabHost.addTab(buildTabSpec("activator_usr", R.string.main_usr,
				R.drawable.icon_usr, this.mUsrIntent));

		/*localTabHost.addTab(buildTabSpec("C_TAB",
				R.string.main_manage_date, R.drawable.icon_3_n,
				this.mCIntent));

		localTabHost.addTab(buildTabSpec("D_TAB", R.string.main_friends,
				R.drawable.icon_4_n, this.mDIntent));

		localTabHost.addTab(buildTabSpec("MORE_TAB", R.string.more,
				R.drawable.icon_5_n, this.mEIntent));*/

	}
	
	private TabHost.TabSpec buildTabSpec(String tag, int resLabel, int resIcon,
			final Intent content) {
		return this.mTabHost.newTabSpec(tag).setIndicator(getString(resLabel),
				getResources().getDrawable(resIcon)).setContent(content);
	}
}