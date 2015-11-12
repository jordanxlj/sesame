package com.xch.stockermaster;

import android.app.Activity;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.TextView;

public class UsrActivity extends Activity{

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		setContentView(R.layout.login);
		
		//TextView tv = new TextView(this);
		//tv.setText("This is Usr Activity!");
		//tv.setGravity(Gravity.CENTER);
		//setContentView(tv);
	}
	
}
