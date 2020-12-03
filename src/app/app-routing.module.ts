import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  //quando alguém acessar o /categories eu quero clicar no path:categories e  carregará o categories module. Após isso, no categories module eu configuro as rotas.
  {path:'categories', loadChildren:() => import(`./pages/categories/categories.module`).then(module => module.CategoriesModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

