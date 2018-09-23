import { Component, OnInit, EventEmitter, Input, Output, SimpleChange, ViewChildren, QueryList, HostListener, ViewChild, ElementRef } from '@angular/core';
import { TableMode } from '../model/TableMode';
import { Sprint } from '../model/Sprint';
import { TaskGroup } from '../model/TaskGroup';
import { Task } from '../model/Task';
import { SprintStatus } from '../model/SprintStatus';
import { AddTaskGroupDirective, appAddTaskLabelDirective, appAddTaskInputDirective } from '../directives/add-task.directive'
import { GroupTasksDirective } from '../directives/group-tasks.directive';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})

export class TableComponent implements OnInit {
  state : TableMode = TableMode.VIEW;
  totalPoints: number = 0;
  addGroupContainerIsVisible: boolean = false;
  test: boolean = false;
  
  private newGroup: TaskGroup = {
    name: null,
    tasks: []
  };

  @Input() sprint : Sprint;

  @Output('update')
  update: EventEmitter<TaskGroup> = new EventEmitter<TaskGroup>();

  @Output('add')
  add: EventEmitter<TaskGroup> = new EventEmitter<TaskGroup>();

  @Output('delete')
  delete: EventEmitter<TaskGroup> = new EventEmitter<TaskGroup>();

  @ViewChildren(appAddTaskInputDirective) addTaskInputs : QueryList<appAddTaskInputDirective>;
  @ViewChildren(appAddTaskLabelDirective) addTaskLabels : QueryList<appAddTaskLabelDirective>;
  @ViewChildren(AddTaskGroupDirective) addTaskGroups : QueryList<AddTaskGroupDirective>;
  @ViewChildren(GroupTasksDirective) groupTasks : QueryList<GroupTasksDirective>;
  @ViewChild('addGroupInput') addGroupInput: ElementRef;

  constructor() { }

  ngOnInit() {
    switch (this.sprint.status) {
      case SprintStatus.NOT_STARTED:
        this.state = TableMode.EDIT;
        break;
      case SprintStatus.COMPLETED:
        this.state = TableMode.COMPLETED;
        break;
      default:
        this.state = TableMode.VIEW;
    }
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    for (let propName in changes) {
      if (propName === 'sprint') {
        this.totalPoints = this.getTotalPoints(this.sprint.taskGroups);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event) {
    if (!event.target.attributes.hasOwnProperty('appaddtasklabel') &&
        !event.target.attributes.hasOwnProperty('appaddtaskinput')) {
        this.closeEmptyAddTaskGroups();
    }

    if (this.addGroupContainerIsVisible &&
        !event.target.attributes.hasOwnProperty('addgrouplabel') &&
        !event.target.attributes.hasOwnProperty('addgroupinput')) {
          this.hideAddGroupContainer();
    }
  }

  trackByFunction(index) {
    return index;
  }

  addTaskGroup() {
    if (this.newGroup.name) {
      this.add.emit({ name: this.newGroup.name, tasks: [] } as TaskGroup);
      this.newGroup = { name: null, tasks: [] } as TaskGroup;
    }
  }

  deleteTaskGroup(taskGroup) {
    this.delete.emit(taskGroup);
  }

  addTask(groupIndex, task, estimate) {
    const taskGroup = this.sprint.taskGroups[groupIndex];
    if (task.value && estimate.value) {
      taskGroup.tasks.push( {
        name: task.value,
        originalEstimate: parseInt(estimate.value),
        remainingEstimate: parseInt(estimate.value)
      } as Task);
      task.focus();
      task.value = '';
      estimate.value = '';
      this.update.emit(taskGroup);
    }
  }

  deleteTask(groupIndex, taskIndex) {
    const taskGroup = this.sprint.taskGroups[groupIndex];
    taskGroup.tasks.splice(taskIndex, 1);
    this.update.emit(taskGroup);
  }

  isCreate = () => this.sprint.status === SprintStatus.NOT_STARTED && this.state === TableMode.EDIT;

  isSprint = () => this.state === TableMode.VIEW;

  isEdit = () => this.sprint.status !== SprintStatus.NOT_STARTED && this.state === TableMode.EDIT;

  isComplete = () => this.state === TableMode.COMPLETED;

  edit = () => this.state = TableMode.EDIT;

  done = () => this.state = TableMode.VIEW;

  showAddGroupContainer() {
    this.addGroupContainerIsVisible = true;
    setTimeout(() => this.addGroupInput.nativeElement.focus(), 0);
  };

  hideAddGroupContainer() {
    if (!this.addGroupInput.nativeElement.value) {
      this.addGroupContainerIsVisible = false;
    }
  }

  toggleTaskGroup(index: number) {
    this.action('toggle', this.groupTasks, index);
  }

  showAllTaskGroups() {
    this.groupTasks.forEach(element => element.show());
  }

  hideAllTaskGroups() {
    this.groupTasks.forEach(element => element.hide())
  }

  openAddTaskGroup(index: number, task: any) {
    this.action('hide', this.addTaskLabels, index);
    this.action('show', this.addTaskGroups, index);
    task.focus();
    this.closeEmptyAddTaskGroups(index);
  }

  closeAddTaskGroup(index: number) {
    this.action('show', this.addTaskLabels, index);
    this.action('hide', this.addTaskGroups, index);
  }

  closeEmptyAddTaskGroups(exceptionIndex: number = undefined) {
    let that = this;
    this.addTaskInputs.
      filter(input => input.isEmpty()).
      map((element,arIndex,array) => {
        if (element !== undefined &&
            array[arIndex + 1] !== undefined &&
            element.index === array[arIndex + 1].index) {
          return element.index;
        }
      }).
      filter(element => element !== exceptionIndex).
      map(element => that.closeAddTaskGroup(element));
  }

  action(action: 'show' | 'hide' | 'toggle', target: QueryList<any>, index: number) {
    target.forEach(element => {
      if (element.index === index && action === 'show') {
        element.show();
      }
      else if (element.index === index && action === 'hide') {
        element.hide();
      }
      else if (element.index === index && action === 'toggle') {
        element.isVisible ? element.hide() : element.show() ;
      }
    });
  }

  getTotalPoints(taskGroups: Array<TaskGroup>): number {
    if (taskGroups == null || taskGroups.length == 0) return 0;
    
    const allTasks = taskGroups.reduce((arr, acc) => arr.concat(acc.tasks), []);
    if (allTasks.length == 0) return 0;

    return allTasks.reduce((accumulator, currentValue) => {
              return {
                name: null,
                originalEstimate: accumulator.originalEstimate + currentValue.originalEstimate,
                remainingEstimate: accumulator.remainingEstimate + currentValue.remainingEstimate
              }
            }).originalEstimate;
  }
}
