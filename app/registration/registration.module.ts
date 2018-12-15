import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { RegistrationRoutingModule } from './registration-routing.module';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { RegistrationComponent } from './registration.component';
import { CommonModule } from '@angular/common';
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { CommonDirectivesModule } from '~/common-directives.module';

if (module['hot']) {
  module['hot'].accept();
}

@NgModule({
  declarations: [RegistrationComponent],
  imports: [
    RegistrationRoutingModule,
    NativeScriptFormsModule,
    NativeScriptCommonModule,
    CommonModule,
    CommonDirectivesModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class RegistrationModule { }
