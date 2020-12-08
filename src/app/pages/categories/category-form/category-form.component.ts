
import { Component, OnInit,AfterContentChecked } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import{ ActivatedRoute, Router } from '@angular/router';
import { Category } from '../shared/category.model';
import{ CategoryService } from '../shared/category.service';
import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit,AfterContentChecked {
  //vai dizer se estamos criando ou editando a categoria;
  currentAction:string;

  //Form será do tipo Categorias
  categoryForm:FormGroup;

  //Título para indicar se estamos editando ou criando uma categoria
  pageTitle:string;

  //Array de strings - msg retornadas do servidor se tiver erros
  serverErrorMessages: string[] = null;

  //Booleano  - objeto que após cliclar no botão de enviar bloqueia o botão para não enviar várias vezes
  submittingform:boolean = false;

  //É obj do recurso que está sendo trabalhado nessa página. Esse category funciona: se o currentAction for editando, faço uma requisição no servidor para pegar o categories/id e o servidor carrega esse obj para eu editar.
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route:ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    //1º definindo a ação(editar ou criar)
    this.setCurrentAction();
    //2º contruindo o formulário
    this.buildCategoryForm();
    //3º carregar a categoria em questão
    this.loadCategory();

  }
  ngAfterContentChecked(){
    this.setPageTitle();
  }
  submitForm(){
    this.submittingform = true;

    if(this.currentAction == 'new')
      this.createCategory();
    else //current action =='edit'
      this.updateCategory();
  }

  //private methods

  //verifica a rota que chegou para saber se a pessoa está editando ou criando
  private setCurrentAction(){
    //aqui, retorna um array contendo os seguimentos da url. Se o primeiro seguimento(url[0]) for NEW, currentAction será setado como new(criando). Caso contrário, será edit.
    if(this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"
  }

  //vou construir o formulário da categoria
  private buildCategoryForm(){
    this.categoryForm = this.formBuilder.group({
      id:[null],
      name:[null, [Validators.required, Validators.minLength(2)]],
      description:[null]
    })
  }

  private loadCategory(){
    //verificar se a ação atual for igual a edit, eu faço a requisição no servidor para trazer a categoria que está sendo editada
    if(this.currentAction == 'edit'){
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get("id")))
      )
      .subscribe(
        (category)=>{
          this.category = category;
          this.categoryForm.patchValue(category) //binds loaded category data to CategoryForm
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
      )
    }
  }

   private setPageTitle(){
    if(this.currentAction == 'new')
      this.pageTitle = 'Cadastro de Nova Categoria'
    else
      {  const categoryName = this.category.name || ""
      this.pageTitle = 'Editando Categoria: ' + categoryName;}
  }

public createCategory(){
  const category: Category = Object.assign(new Category(), this.categoryForm.value);

  this.categoryService.create(category).subscribe(
    category => this.actionsForSuccess(category),
    error => this.actionsForError(error)

  )
}

private updateCategory(){
  const category: Category = Object.assign(new Category(), this.categoryForm.value);

  this.categoryService.update(category).subscribe(
    category => this.actionsForSuccess(category),
    error => this.actionsForError(error)
  )}

private actionsForSuccess(category:Category){
  toastr.success('Solicitação processada com sucesso');
  //redirect / reaload component page
  this.router.navigateByUrl('categories',{skipLocationChange:true}).then(
    () => this.router.navigate(['categories', category.id, 'edit'])
  )

}
private actionsForError(error:any){
  toastr.error('Ocorreu um erro ao processar sua solicitação');

  this.submittingform = false;
  if(error.status === 422)
     this.serverErrorMessages = JSON.parse(error._body).errors;
  else
     this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor tente mais tarde']
}

}
