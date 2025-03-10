import { Routes } from '@angular/router';
import { ProgramListComponent } from './program/program-list/program-list.component';
import { RegisterComponent } from './user/register/register.component';
import { LoginComponent } from './user/login/login.component';
import { ProgramCreateComponent } from './program/program-create/program-create.component';
import { ProgramDetailsComponent } from './program/program-details/program-details.component';

export const routes: Routes = [
    {
        path: '',
        component: ProgramListComponent,
        title: 'Program list'
    },
    {
        path: 'register',
        component: RegisterComponent,
        title: 'Register'
    }, 
    {
        path: 'login',
        component: LoginComponent,
        title: 'Log in'
    },
    {
        path: 'create-program',
        component: ProgramCreateComponent,
        title: 'Create program'
    },
    {
        path: 'programs/:id',
        component: ProgramDetailsComponent,
        title:'Program details'
    }
];

export default routes;