import { Component, OnInit } from '@angular/core';
import {StudentdataService} from 'src/app/studentdata.service'
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  title = 'mess-i-dashboard';
  studentData:any;
  studentHistory:any;
  date = new Date();
  noOfDays:any;
  headers = ['Breakfast','Lunch','Snacks','Dinner','Milk','Egg']

  ngOnInit(): void {
    
    
  }

  constructor(private service:StudentdataService,private auth:AuthService, private router:Router) {
    if(!this.auth.isLoggedIn()){
      this.router.navigate(['login'])
    }
  }

  cleanData(history:any){
    console.log(history)
    for(let j=0;j<this.noOfDays.length;j++){
      if(!(this.noOfDays[j] in history)){
        history[this.noOfDays[j]] = {}
      }
    }
    return history;
    
  }
  async submit(search: any){
    this.studentData = await this.service.getStudentData(search.form.value.roll)
    this.studentHistory = []
  }

  async getMonthData(data: any){
    
    if (data.form.value.year&&data.form.value.month) {
      let num =  new Date(parseInt(data.form.value.year), parseInt(data.form.value.month), 0).getDate();
      this.noOfDays = Array(num).fill(1).map((x, i) => (i + 1).toString());
      this.service.getMonthlydata(this.studentData.roll,data.form.value.year,data.form.value.month).then((res)=>{
        let history = res;
        // console.log(res);
        this.studentHistory = this.cleanData(history);
        // console.log(history)
      });
    }else{
    }
  }
  toggl(){
    console.log("click")
    let res = this.service.togglActive(this.studentData.roll)
    if (res){
      this.studentData.allowed = !this.studentData.allowed
    }
  }

}
