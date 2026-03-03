import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { ListComponent } from './pages/list/list.component';
import { DetailsComponent } from './pages/details/details.component';

@NgModule({
  declarations: [AppComponent, ListComponent, DetailsComponent],
  imports: [BrowserModule, CommonModule, RouterModule.forRoot(routes)],
  bootstrap: [AppComponent]
})
export class AppModule {}
