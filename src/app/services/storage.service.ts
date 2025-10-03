import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';



@Injectable({
  providedIn: 'root'
})
export class StorageService {


  constructor() { }

  async set( storageKey: string, value: any ){
   
    await Preferences.set({
      key: storageKey,
      value : JSON.stringify(value)
    });
    
  }

  async get( storageKey: string ){
    const ret = await Preferences.get({key: storageKey});
    if(ret.value){  
      return JSON.parse( ret.value);
    }else{
      return false;
    }
  }

  async removeItem( storageKey: string ){
    await Preferences.remove( {key: storageKey} );
  }

  async clear(){
    await Preferences.clear();
  }
}