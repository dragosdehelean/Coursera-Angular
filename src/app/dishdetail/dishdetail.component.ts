import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { Dish } from "../shared/dish";
import { DishService } from "../services/dish.service";
import { Params, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { Comment } from "../shared/comment";
@Component({
  selector: "app-dishdetail",
  templateUrl: "./dishdetail.component.html",
  styleUrls: ["./dishdetail.component.scss"]
})
export class DishdetailComponent implements OnInit {
  @ViewChild("cform") commentFormDirective;

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;

  dishcopy: Dish;
  errMess: string;

  commentForm: FormGroup;
  comment: Comment;

  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'Your name is required.',
      'minlength': 'Your name must be at least 2 characters long.'
    },
    'comment': {
      'required': 'Your message is required.',
      'minlength': 'Your message must be at least 2 characters long.'
    }
  };

  constructor(
    private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('baseURL') private baseURL
  ) {
    this.createForm();
  }



  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);

    this.route.params
      .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); },
        errmess => this.errMess = <any>errmess);
  }

  createForm() {
    this.commentForm = this.fb.group({
      rating: [5],
      comment: ['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && (control.dirty || control.touched) && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    this.dishcopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
        errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });

    this.commentForm.reset({
      author: "",
      message: "",
      rating: 5
    });
    this.commentFormDirective.resetForm();



  }

  goBack(): void {
    this.location.back();
  }
}
