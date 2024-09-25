import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from './app.component';
import { ChessBoardComponent } from './modules/chess-board/chess-board.component';
import { AppRoutingModule } from './routes/app-routing.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NavMenuComponent } from './modules/nav-menu/nav-menu.component';


@NgModule({
  declarations: [
    AppComponent,
    ChessBoardComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NavMenuComponent,
  ],
  providers: [
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }