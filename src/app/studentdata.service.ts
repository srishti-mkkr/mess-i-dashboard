import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { environment } from './../environments/environment';
import { RebateRequest, Student } from './interfaces';
import { ChangeStreamReshardCollectionDocument } from 'mongodb';
import { StudentcardComponent } from './studentcard/studentcard.component';

@Injectable({
  providedIn: 'root'
})
export class StudentdataService {

  public studentCache= new Map<string,Student>();
  baseurl = environment.backendURL+"/api";
  constructor(private http:HttpClient, private auth:AuthService ) { }

  put_student_in_cache(student: Student){
    if (this.studentCache.size > 100) {
      this.studentCache.clear;
    }
    this.studentCache.set(student.id,student);
    // console.log(this.studentCache)
  }
  
  async getStudentData(roll:string){
    let url = this.baseurl.concat("/get-student-info/",roll);
    console.log(url);
    return new Promise((resolve, reject) => {
      this.http.get(url,{headers:{
        'x-access-token':this.auth.getToken(),    
      }}).subscribe((res:any)=>{
        console.log(res)
        resolve(res)
      },(e)=>{
        console.log(e)
        reject(e.error)
      })
    });
    
  }

  async getStudentRebates(){
    let url = this.baseurl.concat("/get-rebates/");
    return new Promise((resolve, reject) => {
      this.http.get(url,{
        headers:{
          'x-access-token': this.auth.getToken(),
        }
      }).subscribe((res)=>{
        let true_res:RebateRequest[] = [];
        for (const [roll,roll_data] of Object.entries(res)){
          if(!roll_data.hasOwnProperty('rebates')) continue;
          roll_data.rebates.forEach((element: string[]) => {
            if(element.length != 0){
              true_res.push({
                student:{
                  id: roll,
                  name: roll_data.fullname
                } as Student,
                recieve_date: new Date(Date.UTC(0,0,1)),
                rebate_duration_start: new Date(Date.parse(element[0])),
                rebate_duration_end: new Date(Date.parse(element[1]))
              } as RebateRequest);
            }
          });
        }
        resolve(true_res);
      }, 
      (e)=>{
        reject({});
      });
    });
  }

  async setStudentRebate(rollnumber:string,startDate:string,endDate:string){
    var token=await this.auth.getToken()
    console.log(token)
    let headers = new HttpHeaders({
      'x-access-token':token,
      
    });
      let options = { headers: headers ,responseType:'text' as 'json'};
    let url = this.baseurl.concat("/add-rebate/",rollnumber,'/',startDate,'/',endDate);
    return new Promise((resolve, reject) => {
      this.http.post(url,null,options).subscribe((res:any)=>{
        resolve(res)
      },(e)=>{
        console.log(e)
        reject(e.error)
      })
    });
    
  }

  togglActive(roll:string){
    let url = this.baseurl.concat("/toggle-mess-allowed/",roll);
    return this.http.get(url,{headers:{
      'x-access-token':this.auth.getToken()
    }}).subscribe((res:any)=>{
      console.log(res.status)
      return true
    },(e)=>{
      return false
    })
  }

  async getMonthlydata(roll:string,year:string,month:string){
    let url = this.baseurl.concat("/get-meal-info/",roll,'/',year,'/',month);
    return new Promise((resolve, reject) => {
      this.http.get(url,
        {
          headers:{
            'x-access-token':this.auth.getToken(),    
          }
        }
      ).subscribe((res)=> {
          resolve(res);
      },
      (e)=>{
          reject({})
      })
  });
  }

  async getMonthlyMessdata(hostel:string,year:string,month:string){
    let url = this.baseurl.concat("/get-mess-info/",hostel,'/',year,'/',month);
    return new Promise((resolve,reject)=>
    {
      this.http.get(url,{headers:{
        'x-access-token':this.auth.getToken(),    
      }}).subscribe((res)=>{
        resolve(res);
      },(e)=>{
        reject({});
      })
    }
    )
    
  }

  async getStudentList(startEntry: any){
    let url = this.baseurl.concat("/get-batch-students/",startEntry);
    return new Promise((resolve,reject)=>
    {
      this.http.get(url,{headers:{
        'x-access-token':this.auth.getToken(),    
      }}).subscribe((res)=>{
        resolve(res);
      },(e)=>{
        reject({});
      })
    }
    )
  } 

  getImage(roll:string): Observable<Blob>{
    let url = this.baseurl.concat("/get-image/",roll);
    return this.http.get(url, { 
      responseType: 'blob',
      headers:{
        'x-access-token':this.auth.getToken(),    
      } 
    });
  }


}
