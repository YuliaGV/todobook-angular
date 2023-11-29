import { Component, computed, signal, effect, Injector, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Task } from '../../models/task.model';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  tasks = signal<Task[]>([

    {
      id: uuidv4(), 
      title: "Be awesome",
      completed: true,
      datePosted: new Date()
    },
    {
      id: uuidv4(), 
      title: "Start to use TodoBook",
      completed: true,
      datePosted: new Date()

    }
  
  ]);


  filter = signal<'all'|'pending'|'completed'>('all');

  tasksByFilter = computed( () =>{
    const filter = this.filter();
    const tasks = this.tasks();

    if(filter === 'pending'){
      return tasks.filter(t => !t.completed)
    }

    if(filter === 'completed'){
      return tasks.filter(t => t.completed)
    }

    return tasks;


  })


  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators:[
      Validators.required

    ]
  });

  injector = inject(Injector);


  

  ngOnInit(){
    const storage = localStorage.getItem('tasksListToDo');
    if(storage){
      const tasksList = JSON.parse(storage);
      this.tasks.set(tasksList)
    }
    this.trackTasks();
  }


  trackTasks(){
    effect( () => {
      const tasks = this.tasks();
      localStorage.setItem('tasksListToDo', JSON.stringify(tasks));

    }, {injector: this.injector})
  }




  addTask(){

    if(this.newTaskCtrl.valid){

      const value = this.newTaskCtrl.value.trim();
      if(value !== ''){
        const newTask = {
          id: uuidv4(), 
          title: this.newTaskCtrl.value,
          completed: false,
          datePosted: new Date()
        }

        this.tasks.update((tasks)=>[...tasks, newTask]);

        this.newTaskCtrl.setValue('');

      }
      
    }

    
   
  }

  deleteTask(id: string){
    this.tasks.update((tasks)=>tasks.filter((task)=> task.id !== id));
  }

  deleteCompletedTask(){
    this.tasks.update((tasks)=>tasks.filter((task)=> !task.completed))
  }


  updateTaskStatus(id: string){
    this.tasks.update((tasks)=>{
      return tasks.map((task)=>{
          if(task.id === id){
            return{...task, completed: !task.completed}
          }
          return task; 
      })
     
    })
  }

  updateTaskEditingMode(id: string){
    this.tasks.update((tasks)=>{
      return tasks.map((task)=>{
          if(task.id === id){
            return{...task, editing: true}
          }
          return {
            ...task, editing:false
          }
      })
     
    })
  }



  updateTaskText(id: string, event: Event ){

    const input = event.target as HTMLInputElement;
    const value = input.value.trim();


    if(value !== ''){

      this.tasks.update((tasks)=>{
        return tasks.map((task)=>{
            if(task.id === id){
              return{...task, title: value, editing: false}
            }
            return task
        })
       
      })

      
    
    }


  }


  changeFilter(filter: 'all'|'pending'|'completed'){
    this.filter.set(filter)
  }

  


}
