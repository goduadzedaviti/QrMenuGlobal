import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

type LanguageCode = 'ka' | 'en' | 'ru';

interface CartItem {
  menuItemId: string;
  quantity: number;
  notes: string;
  item: any;
}

@Component({
  selector: 'app-object-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" *ngIf="object">
      <header class="hero">
        <img class="hero__image" [src]="getFullUrl(object.imageUrl)" [alt]="getDisplayName(object)">
        <div class="hero__overlay"></div>
        <div class="hero__content">
          <div class="hero__languages" *ngIf="activeLanguages.length > 0">
            <button
              *ngFor="let language of activeLanguages"
              type="button"
              class="chip"
              [class.chip--active]="selectedLanguage === language"
              (click)="selectLanguage(language)">
              {{ getLanguageLabel(language) }}
            </button>
          </div>

          <h1>{{ getDisplayName(object) }}</h1>
          <p *ngIf="getDisplayAddress(object)">{{ getDisplayAddress(object) }}</p>
          <p *ngIf="getDisplayDescription(object)" class="hero__description">{{ getDisplayDescription(object) }}</p>
        </div>
      </header>

      <main class="content">
        <section *ngIf="activeLanguages.length > 0 && !selectedLanguage" class="panel">
          <div class="section-tag">Step 1</div>
          <h2>{{ t('chooseLanguage') }}</h2>
          <div class="language-grid">
            <button *ngFor="let language of activeLanguages" type="button" class="language-card" (click)="selectLanguage(language)">
              <strong>{{ getLanguageLabel(language) }}</strong>
              <span>{{ getLanguageNativeLabel(language) }}</span>
            </button>
          </div>
        </section>

        <ng-container *ngIf="selectedLanguage || activeLanguages.length === 0">
          <div class="global-actions" *ngIf="selectedLanguage">
            <button type="button" class="waiter-button" (click)="callWaiter()">
              {{ t('callWaiter') }}
            </button>
          </div>
          <section class="panel" *ngIf="!selectedMenu">
            <div class="section-tag">Step 2</div>
            <h2>{{ t('chooseCategory') }}</h2>
            <div class="category-grid">
              <button *ngFor="let menu of menus" type="button" class="category-card" (click)="openCategory(menu)">
                <img *ngIf="menu.imageUrl" [src]="getFullUrl(menu.imageUrl)" [alt]="getDisplayName(menu)">
                <div class="category-card__fallback" *ngIf="!menu.imageUrl"></div>
                <span>{{ getDisplayName(menu) }}</span>
              </button>
            </div>
          </section>

          <section *ngIf="selectedMenu" class="panel">
            <div class="toolbar">
              <button type="button" class="back-button" (click)="backToCategories()">{{ t('back') }}</button>
              <div class="toolbar__status">{{ cartItemCount }} {{ t('itemsCount') }}</div>
            </div>

            <div class="category-hero">
              <img *ngIf="selectedMenu.imageUrl" [src]="getFullUrl(selectedMenu.imageUrl)" [alt]="getDisplayName(selectedMenu)">
              <div class="category-hero__fallback" *ngIf="!selectedMenu.imageUrl"></div>
              <div class="category-hero__content">
                <div class="section-tag">{{ t('category') }}</div>
                <h2>{{ getDisplayName(selectedMenu) }}</h2>
                <p *ngIf="getDisplayDescription(selectedMenu)">{{ getDisplayDescription(selectedMenu) }}</p>
              </div>
            </div>

            <div class="item-list" *ngIf="items.length > 0; else emptyItems">
              <article *ngFor="let item of items" class="item-card">
                <div class="item-card__copy" (click)="openItemDetails(item)">
                  <h3>{{ getDisplayName(item) }}</h3>
                  <p *ngIf="getDisplayDescription(item)">{{ getDisplayDescription(item) }}</p>
                  <span class="price">{{ item.price | currency }}</span>
                </div>
                <img *ngIf="item.imageUrl" [src]="getFullUrl(item.imageUrl)" [alt]="getDisplayName(item)">
                <button type="button" class="item-card__add" (click)="addToCart(item)">
                  {{ t('addToOrder') }}
                </button>
              </article>
            </div>
          </section>
        </ng-container>

        <ng-template #emptyItems>
          <section class="panel empty">
            <p>{{ t('noItems') }}</p>
          </section>
        </ng-template>
      </main>

      <div class="modal-overlay" *ngIf="selectedItem" (click)="closeItemDetails()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <button type="button" class="modal-card__close" (click)="closeItemDetails()">×</button>
          <img *ngIf="selectedItem.imageUrl" [src]="getFullUrl(selectedItem.imageUrl)" [alt]="getDisplayName(selectedItem)">
          <div class="modal-card__body">
            <h2>{{ getDisplayName(selectedItem) }}</h2>
            <span class="price">{{ selectedItem.price | currency }}</span>
            <p>{{ getDisplayDescription(selectedItem) || t('noDescription') }}</p>
            <button type="button" class="primary-button" (click)="addToCart(selectedItem); closeItemDetails()">
              {{ t('addToOrder') }}
            </button>
          </div>
        </div>
      </div>

      <button *ngIf="cart.length > 0" type="button" class="cart-fab" (click)="openCart()">
        <span>{{ cartItemCount }}</span>
        {{ t('viewOrder') }}
      </button>

      <div class="modal-overlay" *ngIf="isCartOpen" (click)="closeCart()">
        <div class="cart-sheet" (click)="$event.stopPropagation()">
          <div class="cart-sheet__header">
            <div>
              <div class="section-tag">{{ t('yourOrder') }}</div>
              <h3>{{ cartItemCount }} {{ t('itemsCount') }}</h3>
            </div>
            <button type="button" class="modal-card__close" (click)="closeCart()">×</button>
          </div>

          <div class="cart-items">
            <section class="cart-item" *ngFor="let cartItem of cart">
              <div class="cart-item__top">
                <strong>{{ getDisplayName(cartItem.item) }}</strong>
                <span>{{ cartItem.item.price | currency }}</span>
              </div>
              <div class="cart-item__actions">
                <button type="button" (click)="changeQuantity(cartItem.menuItemId, -1)">-</button>
                <span>{{ cartItem.quantity }}</span>
                <button type="button" (click)="changeQuantity(cartItem.menuItemId, 1)">+</button>
                <button type="button" class="danger-link" (click)="removeFromCart(cartItem.menuItemId)">{{ t('remove') }}</button>
              </div>
              <textarea [(ngModel)]="cartItem.notes" rows="2" [placeholder]="t('itemNotesPlaceholder')"></textarea>
            </section>
          </div>

          <div class="order-form">
            <label *ngIf="!isTableFromUrl">
              {{ t('tableLabel') }}
              <input [(ngModel)]="orderForm.tableLabel" [placeholder]="t('tablePlaceholder')">
            </label>
            <label>
              {{ t('customerName') }}
              <input [(ngModel)]="orderForm.customerName" [placeholder]="t('customerPlaceholder')">
            </label>
            <label>
              {{ t('orderNotes') }}
              <textarea [(ngModel)]="orderForm.notes" rows="3" [placeholder]="t('orderNotesPlaceholder')"></textarea>
            </label>
          </div>

          <div class="cart-footer">
            <div>
              <div class="muted">{{ t('total') }}</div>
              <strong>{{ cartTotal | currency }}</strong>
            </div>
            <button type="button" class="primary-button" [disabled]="isSubmittingOrder" (click)="submitOrder()">
              {{ isSubmittingOrder ? t('submitting') : t('placeOrder') }}
            </button>
          </div>

          <p class="feedback feedback--error" *ngIf="orderError">{{ orderError }}</p>
          <p class="feedback feedback--success" *ngIf="orderSuccess">{{ orderSuccess }}</p>
        </div>
      </div>

      <!-- Google Review at the bottom -->
      <div class="footer-reviews" *ngIf="object.googleReviewUrl">
        <div class="section-tag mb-2">{{ t('rateUs') }}</div>
        <a [href]="object.googleReviewUrl" target="_blank" class="review-button">
          <img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" alt="Google">
          <span>{{ t('leaveReview') }}</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(180deg, #fff7f0 0%, #ffffff 34%, #fffdf9 100%);
      color: #181c25;
      font-family: "Segoe UI", sans-serif;
    }

    .page {
      min-height: 100vh;
      padding-bottom: 2rem;
    }

    .hero {
      position: relative;
      min-height: 300px;
      overflow: hidden;
    }

    .hero__image,
    .hero__overlay {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .hero__image {
      object-fit: cover;
    }

    .hero__overlay {
      background: linear-gradient(180deg, rgba(13, 16, 24, 0.15) 0%, rgba(13, 16, 24, 0.78) 100%);
    }

    .hero__content,
    .content {
      width: min(100%, 460px);
      margin: 0 auto;
      padding: 1rem;
    }

    .hero__content {
      position: relative;
      z-index: 1;
      color: #ffffff;
      padding-top: 7.5rem;
    }

    .hero__content h1 {
      margin: 0;
      font-size: 2.3rem;
      line-height: 0.95;
      font-weight: 900;
      letter-spacing: -0.04em;
    }

    .hero__content p {
      margin: 0.8rem 0 0;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.5;
    }

    .hero__description {
      max-width: 36ch;
    }

    .footer-reviews {
      margin-top: 3rem;
      padding: 2rem 1rem;
      text-align: center;
      background: #fdf6ee;
      border-top: 1px solid #fee1cc;
    }

    .review-button {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.8rem 1.6rem;
      background: white;
      color: #1a1a1a;
      text-decoration: none;
      border-radius: 999px;
      font-weight: 700;
      font-size: 1rem;
      box-shadow: 0 10px 30px rgba(249, 115, 22, 0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #fee1cc;
    }

    .review-button:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 35px rgba(249, 115, 22, 0.25);
      background: #ffffff;
      border-color: #f97316;
    }

    .review-button img {
      width: 20px;
      height: 20px;
    }

    .hero__languages {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
      margin-bottom: 1rem;
    }

    .chip,
    .back-button,
    .item-card__add,
    .primary-button,
    .cart-fab,
    .category-card,
    .language-card,
    .cart-item__actions button {
      border: 0;
      cursor: pointer;
    }

    .chip {
      border-radius: 999px;
      padding: 0.6rem 0.9rem;
      background: rgba(255, 255, 255, 0.14);
      color: #ffffff;
      font-weight: 700;
    }

    .chip--active {
      background: #ffffff;
      color: #151922;
    }

    .content {
      display: grid;
      gap: 1rem;
      margin-top: -1.5rem;
      position: relative;
      z-index: 2;
    }

    .panel {
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(229, 231, 235, 0.92);
      border-radius: 24px;
      padding: 1rem;
      box-shadow: 0 20px 42px rgba(17, 24, 39, 0.08);
    }

    .section-tag,
    .muted {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #f97316;
    }

    .language-grid,
    .category-grid,
    .item-list,
    .cart-items,
    .order-form {
      display: grid;
      gap: 0.85rem;
      margin-top: 1rem;
    }

    .language-card,
    .category-card {
      width: 100%;
      border-radius: 18px;
      padding: 1rem;
      background: #fffaf6;
      text-align: left;
    }

    .language-card {
      display: grid;
      gap: 0.2rem;
    }

    .language-card span {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .category-card {
      position: relative;
      overflow: hidden;
      min-height: 120px;
      padding: 0;
      color: #ffffff;
      box-shadow: 0 14px 30px rgba(17, 24, 39, 0.14);
    }

    .category-card img,
    .category-card__fallback {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .category-card img {
      object-fit: cover;
    }

    .category-card__fallback {
      background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
    }

    .category-card span {
      position: relative;
      z-index: 1;
      display: block;
      padding: 2.2rem 1rem 1rem;
      font-size: 1.2rem;
      font-weight: 800;
      text-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
    }

    .toolbar,
    .cart-sheet__header,
    .cart-footer,
    .cart-item__top,
    .cart-item__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .back-button {
      border-radius: 999px;
      background: #f3f4f6;
      color: #1f2937;
      padding: 0.7rem 1rem;
      font-weight: 800;
    }

    .toolbar__status {
      color: #6b7280;
      font-weight: 700;
    }

    .category-hero {
      position: relative;
      min-height: 180px;
      overflow: hidden;
      border-radius: 22px;
      margin-top: 1rem;
      background: linear-gradient(135deg, #111827 0%, #374151 100%);
      color: #ffffff;
    }

    .category-hero img,
    .category-hero__fallback {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .category-hero img {
      object-fit: cover;
    }

    .category-hero__content {
      position: relative;
      z-index: 1;
      padding: 1rem;
      min-height: 180px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      background: linear-gradient(180deg, rgba(17, 24, 39, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%);
    }

    .item-card {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.9rem;
      align-items: start;
      border: 1px solid rgba(229, 231, 235, 0.92);
      border-radius: 20px;
      padding: 0.95rem;
      background: #ffffff;
    }

    .item-card img {
      width: 90px;
      height: 90px;
      border-radius: 16px;
      object-fit: cover;
      grid-row: span 2;
    }

    .item-card__copy h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
    }

    .item-card__copy p {
      margin: 0.45rem 0 0;
      color: #6b7280;
      font-size: 0.88rem;
      line-height: 1.45;
    }

    .price {
      display: inline-flex;
      margin-top: 0.85rem;
      padding: 0.44rem 0.72rem;
      border-radius: 999px;
      background: #fff0e4;
      color: #f97316;
      font-weight: 900;
    }

    .item-card__add,
    .primary-button {
      border-radius: 16px;
      background: #f97316;
      color: #ffffff;
      padding: 0.85rem 1rem;
      font-weight: 800;
    }

    .item-card__add {
      grid-column: 1 / -1;
    }

    .empty {
      text-align: center;
      color: #6b7280;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(15, 23, 42, 0.56);
      backdrop-filter: blur(8px);
    }

    .modal-card,
    .cart-sheet {
      width: min(100%, 430px);
      max-height: 90vh;
      overflow: auto;
      border-radius: 26px;
      background: #ffffff;
      box-shadow: 0 24px 50px rgba(15, 23, 42, 0.24);
    }

    .modal-card {
      position: relative;
    }

    .modal-card img {
      width: 100%;
      height: 240px;
      object-fit: cover;
      display: block;
    }

    .modal-card__body,
    .cart-sheet {
      padding: 1rem;
    }

    .modal-card__close {
      width: 40px;
      height: 40px;
      border: 0;
      border-radius: 999px;
      background: #f3f4f6;
      font-size: 1.45rem;
      line-height: 1;
    }

    .cart-sheet h3,
    .modal-card__body h2 {
      margin: 0.3rem 0 0;
      font-size: 1.25rem;
      font-weight: 900;
    }

    .cart-fab {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 60;
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.95rem 1.1rem;
      border-radius: 999px;
      background: #121826;
      color: #ffffff;
      font-weight: 900;
      box-shadow: 0 20px 42px rgba(17, 24, 39, 0.26);
    }

    .cart-fab span {
      min-width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: #f97316;
      padding: 0 0.4rem;
    }

    .cart-item {
      border: 1px solid rgba(229, 231, 235, 0.92);
      border-radius: 18px;
      padding: 0.9rem;
      display: grid;
      gap: 0.75rem;
    }

    .cart-item__actions {
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .cart-item__actions button {
      border-radius: 12px;
      background: #f3f4f6;
      padding: 0.5rem 0.75rem;
      font-weight: 800;
    }

    .danger-link {
      color: #b42318;
    }

    textarea,
    input {
      width: 100%;
      border: 1px solid #dde3ec;
      border-radius: 14px;
      padding: 0.8rem 0.9rem;
      font: inherit;
    }

    .order-form label {
      display: grid;
      gap: 0.4rem;
      color: #374151;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .feedback {
      margin: 0.85rem 0 0;
      font-weight: 800;
    }

    .feedback--error {
      color: #b42318;
    }

    .feedback--success {
      color: #027a48;
    }

    .global-actions {
      display: flex;
      justify-content: center;
      margin-top: 0.5rem;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 1000;
      /* removed pointer-events: none to ensure interaction */
    }

    .waiter-button {
      background: #dc2626;
      color: #ffffff;
      border: 0;
      border-radius: 999px;
      padding: 0.9rem 1.8rem;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 20px 42px rgba(17, 24, 39, 0.4);
      pointer-events: auto;
      transition: transform 0.2s;
    }

    .waiter-button:active {
      transform: scale(0.95);
    }
  `]
})
export class ObjectDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  object: any;
  menus: any[] = [];
  selectedMenu: any;
  items: any[] = [];
  selectedItem: any = null;
  activeLanguages: LanguageCode[] = [];
  selectedLanguage: LanguageCode | null = null;
  cart: CartItem[] = [];
  isCartOpen = false;
  isSubmittingOrder = false;
  orderError = '';
  orderSuccess = '';
  apiUrl = environment.baseUrl;
  isTabsElevated = false;
  orderForm = {
    customerName: '',
    tableLabel: '',
    notes: ''
  };
  isTableFromUrl = false;

  private readonly uiText: Record<LanguageCode, Record<string, string>> = {
    ka: {
      chooseLanguage: 'Choose your language',
      chooseCategory: 'აირჩიე კატეგორია',
      category: 'კატეგორია',
      noItems: 'ამ კატეგორიაში კერძები ჯერ არ არის დამატებული.',
      noDescription: 'აღწერა არ არის მითითებული.',
      addToOrder: 'შეკვეთაში დამატება',
      viewOrder: 'შეკვეთის ნახვა',
      yourOrder: 'შეკვეთა',
      itemsCount: 'პოზიცია',
      remove: 'წაშლა',
      tableLabel: 'მაგიდა / ლოკაცია',
      tablePlaceholder: 'მაგ: Table 4',
      customerName: 'სახელი',
      customerPlaceholder: 'სურვილის შემთხვევაში',
      orderNotes: 'შეკვეთის შენიშვნა',
      orderNotesPlaceholder: 'მაგ: ხახვი არ მინდა',
      itemNotesPlaceholder: 'ამ პოზიციის შენიშვნა',
      total: 'ჯამი',
      placeOrder: 'შეკვეთის გაგზავნა',
      submitting: 'იგზავნება...',
      orderPlaced: 'შეკვეთა გაიგზავნა სამზარეულოში',
      back: 'უკან',
      callWaiter: 'მიმტანის გამოძახება',
      rateUs: 'მოგვეცით შეფასება',
      leaveReview: 'დატოვეთ შეფასება'
    },
    en: {
      chooseLanguage: 'Choose your language',
      chooseCategory: 'Choose a category',
      category: 'Category',
      noItems: 'No items available in this category yet.',
      noDescription: 'No description available.',
      addToOrder: 'Add to order',
      viewOrder: 'View order',
      yourOrder: 'Your order',
      itemsCount: 'items',
      remove: 'Remove',
      tableLabel: 'Table or location',
      tablePlaceholder: 'Example: Table 4',
      customerName: 'Name',
      customerPlaceholder: 'Optional',
      orderNotes: 'Order notes',
      orderNotesPlaceholder: 'Example: no onion',
      itemNotesPlaceholder: 'Notes for this item',
      total: 'Total',
      placeOrder: 'Place order',
      submitting: 'Submitting...',
      orderPlaced: 'Order sent to the kitchen',
      back: 'Back',
      callWaiter: 'Call Waiter',
      rateUs: 'Rate Us',
      leaveReview: 'Leave a Review'
    },
    ru: {
      chooseLanguage: 'Выберите язык',
      chooseCategory: 'Выберите категорию',
      category: 'Категория',
      noItems: 'В этой категории пока нет блюд.',
      noDescription: 'Описание не указано.',
      addToOrder: 'Добавить в заказ',
      viewOrder: 'Открыть заказ',
      yourOrder: 'Ваш заказ',
      itemsCount: 'позиций',
      remove: 'Удалить',
      tableLabel: 'Стол или локация',
      tablePlaceholder: 'Например: Table 4',
      customerName: 'Имя',
      customerPlaceholder: 'Необязательно',
      orderNotes: 'Примечание к заказу',
      orderNotesPlaceholder: 'Например: без лука',
      itemNotesPlaceholder: 'Примечание к позиции',
      total: 'Итого',
      placeOrder: 'Оформить заказ',
      submitting: 'Отправка...',
      orderPlaced: 'Заказ отправлен на кухню',
      back: 'Назад',
      callWaiter: 'Позвать официанта',
      rateUs: 'Оцените нас',
      leaveReview: 'Оставить отзыв'
    },
  };

  isCallingWaiter = false;
  callWaiterSuccess = '';
  callWaiterError = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const table = this.route.snapshot.paramMap.get('table');
    if (!id) {
      return;
    }

    if (table) {
      this.orderForm.tableLabel = table;
      this.isTableFromUrl = true;
    }

    this.api.get('/public/languages').subscribe((languages: string[]) => {
      this.activeLanguages = (languages ?? []).filter((code): code is LanguageCode =>
        code === 'ka' || code === 'en' || code === 'ru'
      );
    });

    this.api.get(`/public/objects/${id}`).subscribe(res => {
      this.object = res.resultData;
    });

    this.api.get(`/public/objects/${id}/menus`).subscribe(res => {
      this.menus = res.resultData;
    });
  }

  ngAfterViewInit() {
    this.syncStickyState();
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  selectLanguage(language: LanguageCode) {
    this.selectedLanguage = language;
  }

  openCategory(menu: any) {
    this.selectedMenu = menu;
    this.api.get(`/public/menus/${menu.id}/items`).subscribe(res => {
      this.items = res.resultData;
    });
  }

  backToCategories() {
    this.selectedMenu = null;
    this.items = [];
  }

  openItemDetails(item: any) {
    this.selectedItem = item;
    document.body.style.overflow = 'hidden';
  }

  closeItemDetails() {
    this.selectedItem = null;
    if (!this.isCartOpen) {
      document.body.style.overflow = '';
    }
  }

  addToCart(item: any) {
    const existing = this.cart.find(entry => entry.menuItemId === item.id);
    if (existing) {
      existing.quantity += 1;
      this.cart = [...this.cart];
    } else {
      this.cart = [...this.cart, { menuItemId: item.id, quantity: 1, notes: '', item }];
    }

    this.orderError = '';
    this.orderSuccess = '';
  }

  removeFromCart(menuItemId: string) {
    this.cart = this.cart.filter(item => item.menuItemId !== menuItemId);
  }

  changeQuantity(menuItemId: string, delta: number) {
    this.cart = this.cart
      .map(item => item.menuItemId === menuItemId ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0);
  }

  openCart() {
    this.isCartOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeCart() {
    this.isCartOpen = false;
    document.body.style.overflow = '';
  }

  callWaiter() {
    if (!this.object?.id) {
      return;
    }

    if (!this.orderForm.tableLabel.trim()) {
      const label = prompt(this.t('tableLabel'));
      if (!label || !label.trim()) return;
      this.orderForm.tableLabel = label.trim();
    }

    this.isCallingWaiter = true;
    this.api.post(`/public/objects/${this.object.id}/waiter`, {
      tableLabel: this.orderForm.tableLabel
    }).subscribe({
      next: () => {
        this.isCallingWaiter = false;
        const msg = this.selectedLanguage === 'ka' ? 'მიმტანი გამოძახებულია!' :
                    this.selectedLanguage === 'ru' ? 'Официант вызван!' :
                    'Waiter called!';
        alert(msg);
      },
      error: () => {
        this.isCallingWaiter = false;
        alert('Error calling waiter.');
      }
    });
  }

  submitOrder() {
    if (!this.object?.id || this.cart.length === 0) {
      return;
    }

    if (!this.orderForm.tableLabel.trim()) {
      this.orderError = 'Table is required.';
      return;
    }

    this.isSubmittingOrder = true;
    this.orderError = '';
    this.orderSuccess = '';

    this.api.post(`/public/objects/${this.object.id}/orders`, {
      customerName: this.orderForm.customerName,
      tableLabel: this.orderForm.tableLabel,
      notes: this.orderForm.notes,
      items: this.cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes
      }))
    }).subscribe({
      next: () => {
        this.isSubmittingOrder = false;
        this.orderSuccess = this.t('orderPlaced');
        this.cart = [];
        this.orderForm = { customerName: '', tableLabel: '', notes: '' };

        setTimeout(() => {
          this.closeCart();
          this.orderSuccess = '';
        }, 2000);
      },
      error: (error) => {
        this.isSubmittingOrder = false;
        this.orderError = error?.error?.errors?.[0] || 'Order submission failed.';
      }
    });
  }

  get cartItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + (Number(item.item.price) * item.quantity), 0);
  }

  t(key: string): string {
    const language = this.selectedLanguage ?? 'en';
    return this.uiText[language][key] ?? this.uiText.en[key] ?? key;
  }

  getFullUrl(url: string | null | undefined): string {
    if (!url) {
      return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80';
    }

    if (url.startsWith('http')) {
      return url;
    }

    return `${this.apiUrl}${url}`;
  }

  getDisplayName(entity: any): string {
    return this.getLocalizedField(entity, 'Name');
  }

  getDisplayDescription(entity: any): string {
    return this.getLocalizedField(entity, 'Description');
  }

  getDisplayAddress(entity: any): string {
    return this.getLocalizedField(entity, 'Address');
  }

  getLanguageLabel(language: LanguageCode): string {
    switch (language) {
      case 'ka':
        return 'ქართული';
      case 'en':
        return 'English';
      case 'ru':
        return 'Русский';
    }
  }

  getLanguageNativeLabel(language: LanguageCode): string {
    return this.getLanguageLabel(language);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.syncStickyState();
  }

  private syncStickyState() {
    this.isTabsElevated = window.scrollY > 8;
  }

  private getLocalizedField(entity: any, baseKey: 'Name' | 'Description' | 'Address'): string {
    if (!entity) {
      return '';
    }

    const defaultValue = entity[this.lowercaseFirst(baseKey)] ?? '';
    const languageKey = this.getLanguageKey(baseKey);
    const localizedValue = languageKey ? entity[languageKey] : '';

    return localizedValue || defaultValue || '';
  }

  private getLanguageKey(baseKey: 'Name' | 'Description' | 'Address'): string | null {
    if (!this.selectedLanguage || this.selectedLanguage === 'ka') {
      return null;
    }

    return `${this.lowercaseFirst(baseKey)}${this.selectedLanguage === 'en' ? 'En' : 'Ru'}`;
  }

  private lowercaseFirst(value: string): string {
    return value.charAt(0).toLowerCase() + value.slice(1);
  }
}
