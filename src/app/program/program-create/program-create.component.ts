import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Exercise, ExerciseOverview, IntensityMetric, VolumeMetric } from '../program.model';
import { ProgramService } from '../program-service/program.service';
import { ExerciseService } from '../../exercise/exercise-service.service';
import { MetricService } from '../../exercise/metric-service.service';
import { FileUploadModule } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TabsModule, TabList } from 'primeng/tabs'; // Import TabList
import { InputNumberModule } from 'primeng/inputnumber';
import { forkJoin } from 'rxjs';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-program-create',
  standalone: true, 
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule,
    CommonModule,
    AccordionModule,
    DividerModule,
    SelectModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    TabsModule,
    InputNumberModule,
    ToastModule
  ],
  templateUrl: './program-create.component.html',
  styleUrl: './program-create.component.css',
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class ProgramCreateComponent implements OnInit {
  programForm: FormGroup;
  uploadedImage: File | null = null;
  currentUser: any;
  loading = false;
  activeWeekTab: string = '0';
  selectedRestTime:Map<string,string>=new Map();
  restTimeMetrics:string[]=['min','s'];

  // Add ViewChild for TabList
  @ViewChild('tablist') tablistComponent!: TabList;

  // Data for dropdowns
  exercises: ExerciseOverview[] = [];
  volumeMetrics: VolumeMetric[] = [];
  intensityMetrics: IntensityMetric[] = [];
  
  // Track selected metrics for each exercise
  selectedVolumeMetrics: Map<string, VolumeMetric> = new Map();
  selectedIntensityMetrics: Map<string, IntensityMetric> = new Map();

  constructor(
    private fb: FormBuilder,
    private programService: ProgramService,
    private exerciseService: ExerciseService,
    private metricService: MetricService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.programForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      weeks: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Create observables for all data loading
    const exercises$ = this.exerciseService.getExercisesOverview();
    const volumeMetrics$ = this.metricService.getVolumeMetrics();
    const intensityMetrics$ = this.metricService.getIntensityMetrics();
    
    // Use forkJoin to wait for all data to load
    forkJoin({
      exercises: exercises$,
      volumeMetrics: volumeMetrics$,
      intensityMetrics: intensityMetrics$
    }).subscribe({
      next: (result) => {
        this.exercises = result.exercises;
        this.volumeMetrics = result.volumeMetrics;
        this.intensityMetrics = result.intensityMetrics;
        
        // Only add the initial week after data is loaded
        this.addWeek();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load form data'
        });
        console.error('Error loading form data:', error);
      }
    });
  }

  get weeks(): FormArray {
    return this.programForm.get('weeks') as FormArray;
  }

  private findSingle(element: HTMLElement, selector: string): HTMLElement | null {
    if (!element) return null;
    return element.querySelector(selector);
  }

  addWeek(): void {
    const weekForm = this.fb.group({
      workouts: this.fb.array([])
    });
    this.weeks.push(weekForm);
    
    // Add initial workout to the new week
    this.addWorkout(this.weeks.length - 1);
    
    // Set active week tab
    this.activeWeekTab = (this.weeks.length - 1).toString();
    
    // Schedule scrolling to the newly added tab
    setTimeout(() => this.scrollToActiveTab(), 100);
  }

  removeWeek(weekIndex: number): void {
    this.weeks.removeAt(weekIndex);
    if (parseInt(this.activeWeekTab) === weekIndex) {
      const newIndex = Math.max(0, weekIndex - 1);
      this.activeWeekTab = newIndex.toString();
    } else if (parseInt(this.activeWeekTab) > weekIndex) {
      // Adjust active tab if we removed a week before the active one
      this.activeWeekTab = (parseInt(this.activeWeekTab) - 1).toString();
    }
    
    // Update tab navigation after removing a tab
    setTimeout(() => {
      if (this.tablistComponent) {
        this.tablistComponent.updateButtonState();
        this.tablistComponent.updateInkBar();
        this.scrollToActiveTab();
      }
    }, 100);
  }

  // Method to scroll to the active tab
  scrollToActiveTab(): void {
    if (this.tablistComponent) {
      const element = this.findSingle(this.tablistComponent.content.nativeElement, 
        `[data-pc-name="tab"][data-p-active="true"]`);
      if (element?.scrollIntoView) {
        element.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  // Method to handle tab changes
  onTabChange(event: any): void {
    this.activeWeekTab = event.index.toString();
    this.scrollToActiveTab();
  }

  // Rest of the component remains the same...
  
  getWorkouts(weekIndex: number): FormArray {
    return this.weeks.at(weekIndex).get('workouts') as FormArray;
  }

  addWorkout(weekIndex: number): void {
    const workoutForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      number: [''],
      workoutExercises: this.fb.array([])
    });
    this.getWorkouts(weekIndex).push(workoutForm);
    
    // Add initial exercise to the new workout
    this.addWorkoutExercise(weekIndex, this.getWorkouts(weekIndex).length - 1);
  }

  removeWorkout(weekIndex: number, workoutIndex: number): void {
    this.getWorkouts(weekIndex).removeAt(workoutIndex);
  }

  getWorkoutExercises(weekIndex: number, workoutIndex: number): FormArray {
    return this.getWorkouts(weekIndex).at(workoutIndex).get('workoutExercises') as FormArray;
  }

  addWorkoutExercise(weekIndex: number, workoutIndex: number): void {
    const exerciseForm = this.fb.group({
      exercise: [null, Validators.required],
      volumeMetric: [null, Validators.required],
      intensityMetric: [null, Validators.required],
      sets: this.fb.array([]),
      minimumRestTime:[0, Validators.required],
      maximumRestTime:[60, Validators.required],
      restTimeMetric:[this.restTimeMetrics[0], Validators.required]
    });
    
    this.getWorkoutExercises(weekIndex, workoutIndex).push(exerciseForm);
    
    // Get the index of the newly added exercise
    const exerciseIndex = this.getWorkoutExercises(weekIndex, workoutIndex).length - 1;
    const key = `${weekIndex}-${workoutIndex}-${exerciseIndex}`;
    
    // Set default metrics if available
    const defaultVolumeMetric = this.volumeMetrics.length > 0 ? this.volumeMetrics[0] : null;
    const defaultIntensityMetric = this.intensityMetrics.length > 0 ? this.intensityMetrics[0] : null;
    
    // Update the form control values
    const exerciseControl = this.getWorkoutExercises(weekIndex, workoutIndex).at(exerciseIndex);
    if (defaultVolumeMetric) {
      exerciseControl.get('volumeMetric')?.setValue(defaultVolumeMetric);
      this.selectedVolumeMetrics.set(key, defaultVolumeMetric);
    }
    
    if (defaultIntensityMetric) {
      exerciseControl.get('intensityMetric')?.setValue(defaultIntensityMetric);
      this.selectedIntensityMetrics.set(key, defaultIntensityMetric);
    }
    
    // Add set after setting the metrics
    this.addSet(weekIndex, workoutIndex, exerciseIndex);
  }

  removeWorkoutExercise(weekIndex: number, workoutIndex: number, exerciseIndex: number): void {
    this.getWorkoutExercises(weekIndex, workoutIndex).removeAt(exerciseIndex);
    
    // Remove the metric selections from the maps
    const key = `${weekIndex}-${workoutIndex}-${exerciseIndex}`;
    this.selectedVolumeMetrics.delete(key);
    this.selectedIntensityMetrics.delete(key);
  }

  getSets(weekIndex: number, workoutIndex: number, exerciseIndex: number): FormArray {
    return this.getWorkoutExercises(weekIndex, workoutIndex)
      .at(exerciseIndex).get('sets') as FormArray;
  }

  addSet(weekIndex: number, workoutIndex: number, exerciseIndex: number): void {
    // Get the parent exercise to access its selected metrics
    const exercise = this.getWorkoutExercises(weekIndex, workoutIndex).at(exerciseIndex);
    const volumeMetric = exercise.get('volumeMetric')?.value;
    const intensityMetric = exercise.get('intensityMetric')?.value;
    
    const setForm = this.fb.group({
      volume: this.fb.group({
        minimumVolume: [null],
        maximumVolume: [null, Validators.required]
      }),
      intensity: this.fb.group({
        minimumIntensity: [null],
        maximumIntensity: [null, Validators.required]
      }),
      volumeMetric: [volumeMetric], 
      intensityMetric: [intensityMetric]
    });
    
    this.getSets(weekIndex, workoutIndex, exerciseIndex).push(setForm);
  }

  removeSet(weekIndex: number, workoutIndex: number, exerciseIndex: number, setIndex: number): void {
    this.getSets(weekIndex, workoutIndex, exerciseIndex).removeAt(setIndex);
  }

  onVolumeMetricChange(weekIndex: number, workoutIndex: number, exerciseIndex: number, event: any): void {
    const selectedMetric = event.value;
    const key = `${weekIndex}-${workoutIndex}-${exerciseIndex}`;
    
    if (selectedMetric) {
      this.selectedVolumeMetrics.set(key, selectedMetric);
      
      // Update all existing sets with the new metric
      const sets = this.getSets(weekIndex, workoutIndex, exerciseIndex);
      for (let i = 0; i < sets.length; i++) {
        sets.at(i).get('volumeMetric')?.setValue(selectedMetric);
      }
    }
  }
  
  onIntensityMetricChange(weekIndex: number, workoutIndex: number, exerciseIndex: number, event: any): void {
    const selectedMetric = event.value;
    const key = `${weekIndex}-${workoutIndex}-${exerciseIndex}`;
    
    if (selectedMetric) {
      this.selectedIntensityMetrics.set(key, selectedMetric);
      
      // Update all existing sets with the new metric
      const sets = this.getSets(weekIndex, workoutIndex, exerciseIndex);
      for (let i = 0; i < sets.length; i++) {
        sets.at(i).get('intensityMetric')?.setValue(selectedMetric);
      }
    }
  }
  
  isVolumeRange(weekIndex: number, workoutIndex: number, exerciseIndex: number): boolean {
    const key = `${weekIndex}-${workoutIndex}-${exerciseIndex}`;
    const metric = this.selectedVolumeMetrics.get(key);
    return metric?.range || false;
  }
  
  isIntensityRange(weekIndex: number, workoutIndex: number, exerciseIndex: number): boolean {
    const key = `${weekIndex}-${workoutIndex}-${exerciseIndex}`;
    const metric = this.selectedIntensityMetrics.get(key);
    return metric?.range || false;
  }

  onImageUpload(event: any): void {
    if (event.files && event.files.length > 0) {
      this.uploadedImage = event.files[0];
    }
  }

  onSubmit(): void {
    if (this.programForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix the errors in the form before submitting'
      });
      return;
    }
  
    this.loading = true;
    
    // Use the service to prepare the form data
    const formData = this.programService.prepareFormData(this.programForm.value, this.uploadedImage);
    
    this.programService.createProgram(formData).subscribe({
      next: (result: any) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Program created successfully'
        });
        this.router.navigate(['/programs', result.id]);
      },
      error: (error: any) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while creating the program'
        });
        console.error('Error creating program:', error);
      }
    });
  }

  onRestTimeMetricChange(weekIndex: number, workoutIndex: number, exerciseIndex: number, event: any) {
    const selectedMetric = event.value;
    const key = `${weekIndex}-${workoutIndex}-${exerciseIndex}`;
    const exerciseControl = this.getWorkoutExercises(weekIndex, workoutIndex).at(exerciseIndex);
    
    if (selectedMetric) {
      this.selectedRestTime.set(key, selectedMetric);
      
      // Get current values
      const currentMin = exerciseControl.get('minimumRestTime')?.value || 0;
      const currentMax = exerciseControl.get('maximumRestTime')?.value || 0;
      
      // If changing to 'min', multiply by 60 (converting from seconds)
      if (selectedMetric === 'min') {
        exerciseControl.get('minimumRestTime')?.setValue(Math.ceil(currentMin / 60));
        exerciseControl.get('maximumRestTime')?.setValue(Math.ceil(currentMax / 60));
      }
      // If changing from 'min' to 's', divide by 60 (converting to seconds)
      else {
        exerciseControl.get('minimumRestTime')?.setValue(currentMin * 60);
        exerciseControl.get('maximumRestTime')?.setValue(currentMax * 60);
      }
    }
  }

}