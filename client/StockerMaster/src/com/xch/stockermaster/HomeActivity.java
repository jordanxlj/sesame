package com.xch.stockermaster;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.SimpleAdapter;
import android.widget.TextView;


public class HomeActivity extends Activity {
		private ArrayList<Map<String,Object>> mInfos= new ArrayList<Map<String,Object>>();
		private ListView mListView;
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onCreate(savedInstanceState);
				mListView = new ListView(this);
				
				String[] info_Names={"芭田股份", "辉煌科技", "金螳螂", "海南航空", "三安光电", "中国中车", "中国核电", "包钢股份", "紫金矿业"};
				String[] info_ids = {"002170", "002296", "002081", "600221", "600703", "601766", "601985", "600010", "601899"};
				double[] info_prices = {13.28, 18.39, 17.55, 4.21, 24.26, 14.77, 11.21, 4.36, 3.77};
				double[] info_waves = {1.45, 0, 0.06, -0.47, -0.26, -0.54, 1.91, 2.35, -1.05};
				
				
				for (int i = 0; i < info_Names.length; i++) {
					Map<String,Object> item = new HashMap<String,Object>();
					item.put("name", info_Names[i]);
					item.put("id", info_ids[i]);
					item.put("price", info_prices[i]);
					item.put("wave", info_waves[i]);
					mInfos.add(item);
				}

				MyAdapter adapter = new MyAdapter(this, mInfos);
				mListView.setAdapter(adapter);

				setContentView(mListView);
	}

	private class MyAdapter extends BaseAdapter {

		private Context context;                     
	    private List<Map<String, Object>> listItems;   
	    private LayoutInflater listContainer;        
	    private boolean[] hasChecked;              
	    public final class ListItemView{                
	            public TextView name;     
	            public TextView id;
	            public TextView price;
	            public TextView wave;
	            public CheckBox check;   
	            public Button detail;          
	     }     
	    public MyAdapter(Context context, List<Map<String, Object>> listItems) {   
	        this.context = context;            
	        listContainer = LayoutInflater.from(context);   //创建视图容器并设置上下文   
	        this.listItems = listItems;   
	        hasChecked = new boolean[getCount()];   
	    }   

		public int getCount() {
			return listItems.size();
		}

		public Object getItem(int position) {
			return null;
		}

		public long getItemId(int position) {
			return 0;
		}

		public View getView(int position, View convertView, ViewGroup parent) {
			final int selectID = position;
			ListItemView  listItemView = null;   
	        if (convertView == null) {   
	            listItemView = new ListItemView();    
	            //获取list_item布局文件的视图   
	            convertView = listContainer.inflate(R.layout.myinfo, null);   
	            //获取控件对象   
	            //listItemView.img = (ImageView)convertView.findViewById(R.id.info_img);   
	            listItemView.name = (TextView)convertView.findViewById(R.id.info_name);   
	            listItemView.id = (TextView)convertView.findViewById(R.id.info_id); 
	            listItemView.price = (TextView)convertView.findViewById(R.id.info_price);
	            listItemView.wave = (TextView)convertView.findViewById(R.id.info_wave);
	            listItemView.detail= (Button)convertView.findViewById(R.id.btn);   
	            listItemView.check = (CheckBox)convertView.findViewById(R.id.checkBox);   
	              
	            convertView.setTag(listItemView);  

	            listItemView.name.setText((String) listItems.get(   
	                    position).get("name")); 
	            listItemView.id.setText((String) listItems.get(   
	                    position).get("id")); 
	            listItemView.price.setText((String) listItems.get(   
	                    position).get("price").toString());
	            listItemView.wave.setText((String) listItems.get(   
	                    position).get("wave").toString() + "%"); 
	            
	            if ((double)(Double.parseDouble(listItems.get(position).get("wave").toString())) > 0) {
	                listItemView.wave.setBackgroundColor(0xff0000);
	            } else {
	            	listItemView.wave.setBackgroundColor(0x00ff00);
	            }

	            listItemView.detail.setOnClickListener(new View.OnClickListener() {
					public void onClick(View v) {
						showDetailInfo(selectID);
					}
				});

	            listItemView.check   
	                    .setOnCheckedChangeListener(new CheckBox.OnCheckedChangeListener() {   
	                        public void onCheckedChanged(CompoundButton buttonView,   
	                                boolean isChecked) {   
	                            //记录联系人选中状态   
	                            checkedChange(selectID);   
	                        }
  
	            });  
	        }else {   
	            listItemView = (ListItemView)convertView.getTag();   
	        } 
			return convertView;
		}

		private void checkedChange(int checkedID) {   
	        hasChecked[checkedID] = !hasChecked(checkedID);   
	    }

		public boolean hasChecked(int checkedID) {   
	        return hasChecked[checkedID];   
	    } 

	    private void showDetailInfo(int clickID) {   
	        new AlertDialog.Builder(context)
	        .setTitle(listItems.get(clickID).get("name")+" ")   
	        .setMessage("代码:"+listItems.get(clickID).get("id").toString()+"当前价格："+listItems.get(clickID).get("price").toString())                 
	        .setPositiveButton("确定", null)   
	        .show();   
	    } 
	}

}