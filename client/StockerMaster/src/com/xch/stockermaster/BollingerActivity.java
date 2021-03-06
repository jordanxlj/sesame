package com.xch.stockermaster;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceHolder.Callback;
import android.view.SurfaceView;
import android.view.View;
import android.view.View.OnTouchListener;
import android.widget.TextView;

public class BollingerActivity extends Activity {
	private SurfaceHolder holder;
	double current[]={25.3,23.8,22.2,21.3,23.43,24.46,25.98,27.45,29.51,28.4,26.94,29.63,30.38,31.4,28.26,28.39,26.98,24.28,21.85,19.67,17.77,19.55,21.51,20.18,18.76,19.8,18.34,19.52,20.19,20.05,20.1,18.09,16.38,18.01,17.45,18.11,18.85,18.7,18.24,19.1,17.85,18.41,17.97,17.99,19.1,19.91,21.0,21.15,20.71,21.54,21.86,22.43,23.02,20.72,21.51,22.32,22.35,22.07,22.29,24.02,23.42,22.5,22.2,23.68,23.59,24.5};
    double mean[]={24.332,24.19,24.114,24.085,24.124,24.373,24.728,25.073,25.395,25.715,25.865,26.069,26.344,26.537,26.734,26.704,26.667,26.546,26.342,26.159,25.98,25.604,25.392,25.357,25.301,25.068,24.834,24.453,24.056,23.59,23.172,22.831,22.253,21.554,20.884,20.343,19.829,19.423,19.144,18.964,18.935,18.939,18.882,18.705,18.596,18.613,18.618,18.751,18.833,18.858,18.933,19.021,19.238,19.57,19.706,19.908,20.119,20.294,20.462,20.665,20.911,21.19,21.394,21.605,21.89,22.114};
    double up[] = {31.566,31.23,31.136,31.133,31.101,30.862,30.362,30.095,30.151,30.67,30.952,30.983,31.406,31.896,32.49,32.422,32.332,32.073,31.887,32.033,32.391,32.946,33.164,33.192,33.266,33.498,33.571,33.614,33.349,32.675,32.101,31.679,30.751,29.55,27.613,26.309,24.581,22.87,21.781,21.314,21.264,21.26,21.196,20.709,20.502,20.531,20.551,20.938,21.239,21.333,21.627,21.965,22.498,22.948,23.04,23.162,23.424,23.682,23.852,23.982,24.45,24.595,24.592,24.404,24.289,24.254};
    double down[] =	{17.097,17.15,17.092,17.036,17.147,17.883,19.094,20.05,20.639,20.761,20.778,21.154,21.282,21.177,20.978,20.986,21.003,21.019,20.797,20.284,19.57,18.262,17.619,17.522,17.336,16.637,16.098,15.291,14.763,14.505,14.244,13.982,13.756,13.557,14.155,14.378,15.078,15.976,16.507,16.613,16.606,16.618,16.568,16.701,16.689,16.694,16.685,16.564,16.426,16.384,16.239,16.077,15.978,16.192,16.371,16.655,16.814,16.906,17.073,17.348,17.372,17.784,18.196,18.807,19.491,19.975};
    int step = 10;
    int off = 60;
    int weight = 10;
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		//setContentView(new BollingerView(this));
		Intent myIntent = getIntent();
        String stocker_id = myIntent.getStringExtra("id");
        setContentView(R.layout.bollinger);
        TextView title=(TextView)findViewById(R.id.title);
        title.setText("ID:" + stocker_id);
        
        final SurfaceView surface = (SurfaceView) findViewById(R.id.surfaceview);
        
        holder = surface.getHolder(); 
        holder.addCallback(new Callback() { 
            @Override 
            public void surfaceDestroyed(SurfaceHolder holder) { 
  
            } 
            
            @Override 
            public void surfaceCreated(SurfaceHolder holder) {
                Canvas canvas = holder.lockCanvas(); 
                Paint paint_current=new Paint();
                paint_current.setColor(Color.CYAN);
                Paint paint_up = new Paint();
                paint_up.setColor(Color.GREEN);
                paint_up.setTypeface(Typeface.defaultFromStyle(Typeface.BOLD));
                Paint paint_down = new Paint();
                paint_down.setColor(Color.BLUE);
                paint_down.setTypeface(Typeface.defaultFromStyle(Typeface.BOLD));
                Paint paint_mean = new Paint();
                paint_mean.setColor(Color.RED);
                paint_mean.setTypeface(Typeface.defaultFromStyle(Typeface.BOLD));
                
                Paint paint_grid = new Paint();
                paint_grid.setColor(Color.WHITE);
                float width = surface.getMeasuredWidth();
                float hight = surface.getMeasuredHeight();
                canvas.drawLine(0, off, width, off, paint_grid);  //x
                canvas.drawLine(0, off, 0, hight, paint_grid);  //y
                canvas.drawLine(width-1, off, width-1, hight, paint_grid);
                canvas.drawLine(0, hight-1, width, hight-1, paint_grid);
                
    			for (int i = 0; i < 65; i++) {
    				canvas.drawCircle(i * step, (float) current[i] * weight + off, 2, paint_current);
    				canvas.drawLine((float)i * step, (float)up[i] * weight + off, (float)(i + 1) * step, (float)up[i + 1] * weight + off, paint_up);
    				canvas.drawLine((float)i * step, (float)down[i] * weight + off, (float)(i + 1) * step, (float)down[i + 1] * weight + off, paint_down);
    				canvas.drawLine((float)i * step, (float)mean[i] * weight + off, (float)(i + 1) * step, (float)mean[i + 1] * weight + off, paint_mean);
    			}
                holder.unlockCanvasAndPost(canvas); 
                holder.lockCanvas(new Rect(0, 0, 0, 0)); 
                holder.unlockCanvasAndPost(canvas); 
                holder.lockCanvas(new Rect(0, 0, 0, 0)); 
                holder.unlockCanvasAndPost(canvas); 
            } 
            @Override 
            public void surfaceChanged(SurfaceHolder holder, int format, 
                    int width, int height) { 
  
            } 
        }); 
        surface.setOnTouchListener(new OnTouchListener() { 
  
            @Override 
            public boolean onTouch(View v, MotionEvent event) { 
                if (event.getAction() == MotionEvent.ACTION_DOWN) { 
                    int cx = (int) event.getX(); 
                    int cy = (int) event.getY(); 
                    System.out.println(cx+"==="+cy);
                    
                    Canvas canvas = holder.lockCanvas(new Rect(cx - 60, 
                            cy - 60, cx + 60, cy + 60));
                    //canvas.save(); 
                    // ��ת���� 
                    //canvas.rotate(30, cx, cy); 
                    //paint.setColor(Color.RED); 
                    //paint.setAntiAlias(true); 
                    //canvas.drawCircle(cx, cy, 50, paint); 
                //    canvas.drawRect(cx - 40, cy - 40, cx, cy, paint); 
//                    canvas.restore(); 
//                    paint.setColor(Color.GREEN); 
//                    canvas.drawRect(cx, cy, cx + 40, cy + 40, paint); 
                    holder.unlockCanvasAndPost(canvas); 
                } 
                return false; 
            } 
        }); 
    }
}