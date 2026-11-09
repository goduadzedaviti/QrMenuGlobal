import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef } from '@angular/core';
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
        </div>
      </header>

      <main class="content">

        <!-- Step 2: Unified Menu with ScrollSpy -->
        <ng-container *ngIf="selectedLanguage || activeLanguages.length === 0">
          <div class="global-actions" *ngIf="selectedLanguage">
            <button type="button" class="waiter-button" (click)="callWaiter()" [disabled]="isCallingWaiter">
              {{ isCallingWaiter ? t('submitting') : t('callWaiter') }}
            </button>
            <button type="button" class="waiter-button bill-button" (click)="requestBill()" [disabled]="isRequestingBill">
              {{ isRequestingBill ? t('submitting') : t('requestBill') }}
            </button>
          </div>

          <!-- Sticky Category Nav -->
          <nav class="category-nav" *ngIf="menus.length > 0" [class.category-nav--sticky]="isTabsElevated">
            <div class="category-nav__wrapper">
              <button type="button" class="search-toggle" (click)="toggleSearch()">
                <i class="bi" [class.bi-search]="!isSearchOpen" [class.bi-x]="isSearchOpen"></i>
              </button>
              
              <div class="search-box" [class.search-box--open]="isSearchOpen">
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery" 
                  [placeholder]="t('chooseCategory')" 
                  class="search-input">
              </div>

              <div class="category-nav__scroll" *ngIf="!isSearchOpen">
                <button 
                  *ngFor="let menu of menus" 
                  type="button" 
                  class="category-nav__link"
                  [class.category-nav__link--active]="activeCategoryId === menu.id"
                  (click)="scrollToCategory(menu.id)">
                  {{ getDisplayName(menu) }}
                </button>
              </div>
            </div>
          </nav>

          <div class="menu-sections">
            <section *ngFor="let menu of filteredMenus" [id]="'category-' + menu.id" class="menu-section">
              <header class="menu-section__header" (click)="toggleCategory(menu.id)">
                <h2 class="menu-section__title">{{ getDisplayName(menu) }}</h2>
                <i class="bi bi-chevron-down menu-section__chevron" [class.menu-section__chevron--collapsed]="isCategoryCollapsed(menu.id)"></i>
              </header>
              
              <div class="menu-section__content" [class.menu-section__content--collapsed]="isCategoryCollapsed(menu.id)">
                <div class="item-grid" *ngIf="menu.items && menu.items.length > 0; else emptyItems">
                  <article *ngFor="let item of menu.items" class="premium-card">
                    <div class="premium-card__image-container" (click)="openItemDetails(item)">
                      <!-- Prioritize Image if exists -->
                      <img *ngIf="item.imageUrl" [src]="getFullUrl(item.imageUrl)" [alt]="getDisplayName(item)">
                      
                      <!-- Show 3D Model only if no Image and Model exists -->
                      <model-viewer
                        *ngIf="!item.imageUrl && item.showAr && item.modelUrl"
                        #cardViewer
                        [src]="getFullUrl(item.modelUrl)"
                        class="premium-card__model"
                        ar
                        ar-modes="webxr scene-viewer quick-look"
                        auto-rotate
                        camera-controls
                        touch-action="pan-y"
                        interaction-prompt="none">
                      </model-viewer>

                      <div class="premium-card__fallback" *ngIf="!item.imageUrl && (!item.showAr || !item.modelUrl)"></div>

                      <button type="button" class="premium-card__add-btn" (click)="addToCart(item); $event.stopPropagation()">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                    <div class="premium-card__content" (click)="openItemDetails(item)">
                      <button type="button" class="view-3d-btn--card" *ngIf="item.showAr && item.modelUrl">
                        <i class="bi bi-box"></i> {{ t('viewIn3D') }}
                      </button>
                      <h3 class="premium-card__title">{{ getDisplayName(item) }}</h3>
                      <p class="premium-card__subtitle" *ngIf="getDisplayDescription(item)">{{ getDisplayDescription(item) }}</p>
                      <div class="premium-card__price">{{ item.price | currency }}</div>
                    </div>
                  </article>
                </div>
              </div>
            </section>
            
            <div *ngIf="filteredMenus.length === 0" class="empty-state">
              <p>{{ t('noItems') }}</p>
            </div>
          </div>
        </ng-container>

        <ng-template #emptyItems>
          <div class="empty-state">
            <p>{{ t('noItems') }}</p>
          </div>
        </ng-template>
      </main>

      <!-- Review Links -->
      <div class="review-section" *ngIf="object?.googleReviewUrl || object?.tripAdvisorUrl">
        <h3 class="review-title">{{ t('leaveReview') }}</h3>
        <div class="review-buttons">
          <a *ngIf="object?.googleReviewUrl" [href]="object.googleReviewUrl" target="_blank" class="review-btn review-btn--google">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22px" height="22px">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.2-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>{{ t('leaveGoogleReview') || 'Google Review' }}</span>
          </a>
          <a *ngIf="object?.tripAdvisorUrl" [href]="object.tripAdvisorUrl" target="_blank" class="review-btn review-btn--tripadvisor">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="22px" height="22px">
              <path fill="#00aa6c" d="M256 0c-141.4 0-256 114.6-256 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm0 435.3c-99 0-179.3-80.3-179.3-179.3S157 76.7 256 76.7 435.3 157 435.3 256 355 435.3 256 435.3zm-104.9-195c-20.9 0-38 17.1-38 38s17.1 38 38 38 38-17.1 38-38-17.1-38-38-38zm209.8 0c-20.9 0-38 17.1-38 38s17.1 38 38 38 38-17.1 38-38-17.1-38-38-38zm0-62.8c-42.5 0-78.5 28.5-90.9 67.5-3.3-.4-6.6-.8-10-.8-4.9 0-9.8.5-14.6 1.1-12-38.6-47.5-66.8-89.4-66.8-51.9 0-94 42.1-94 94s42.1 94 94 94c34.7 0 65-18.9 81.3-46.8 6.6 2.4 13.6 3.8 20.8 3.8 6 0 11.9-1 17.5-2.9 16.5 27.5 46.5 45.9 80.9 45.9 51.9 0 94-42.1 94-94s-42.1-94-94-94zM151.1 328.7c-32.2 0-58.4-26.2-58.4-58.4s26.2-58.4 58.4-58.4 58.4 26.2 58.4 58.4-26.2 58.4-58.4 58.4zm209.8 0c-32.2 0-58.4-26.2-58.4-58.4s26.2-58.4 58.4-58.4 58.4 26.2 58.4 58.4-26.2 58.4-58.4 58.4zm-141.7-65.7c2.8 19.3 11.5 36.6 24.3 50.4l-25.1 35.8-30.8-40.8c21-12 34.6-28.8 31.6-45.4z"/>
            </svg>
            <span>{{ t('leaveTripAdvisorReview') || 'TripAdvisor Review' }}</span>
          </a>
        </div>
      </div>

      <!-- Portals & Modals same as before -->
      <div class="modal-overlay" *ngIf="selectedItem" (click)="closeItemDetails()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <button type="button" class="modal-card__close" (click)="closeItemDetails()">×</button>
          <div class="modal-card__media">
            <model-viewer
              *ngIf="selectedItem.showAr && selectedItem.modelUrl"
              #itemModelViewer
              [src]="getFullUrl(selectedItem.modelUrl)"
              class="modal-card__model"
              ar
              ar-modes="webxr scene-viewer quick-look"
              auto-rotate
              auto-rotate-delay="0"
              camera-controls
              camera-orbit="0deg 0deg 105%">
            </model-viewer>
            <img *ngIf="(!selectedItem.showAr || !selectedItem.modelUrl) && selectedItem.imageUrl" [src]="getFullUrl(selectedItem.imageUrl)" [alt]="getDisplayName(selectedItem)">
          </div>
          <div class="modal-card__body">
            <div class="d-flex justify-content-between align-items-start">
              <h2>{{ getDisplayName(selectedItem) }}</h2>
              <span class="price-pill">{{ selectedItem.price | currency }}</span>
            </div>
            <p class="modal-description">{{ getDisplayDescription(selectedItem) || t('noDescription') }}</p>
            <div class="modal-actions">
              <button type="button" class="view-3d-btn--modal" *ngIf="selectedItem.showAr && selectedItem.modelUrl" (click)="itemModelViewer.nativeElement.activateAR()">
                <i class="bi bi-box"></i> {{ t('viewIn3D') }}
              </button>
              <button type="button" class="primary-button" (click)="addToCart(selectedItem); closeItemDetails()">
                {{ t('addToOrder') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart FAB -->
      <button *ngIf="cart.length > 0" type="button" class="cart-fab" (click)="openCart()">
        <div class="cart-fab__info">
          <span class="cart-count">{{ cartItemCount }}</span>
          <span class="cart-total">{{ cartTotal | currency }}</span>
        </div>
        <span class="cart-fab__label">{{ t('viewOrder') }}</span>
      </button>

      <div class="modal-overlay" [class.modal-overlay--bottom]="isCartOpen" *ngIf="isCartOpen" (click)="closeCart()">
        <div class="cart-sheet" (click)="$event.stopPropagation()">
          <div class="cart-sheet__header">
            <div>
              <div class="section-tag">{{ t('yourOrder') }}</div>
              <h3>{{ cartItemCount }} {{ t('itemsCount') }}</h3>
            </div>
            <button type="button" class="close-btn" (click)="closeCart()">×</button>
          </div>

          <div class="cart-body">
            <div class="cart-items">
              <div class="cart-item" *ngFor="let cartItem of cart">
                <div class="cart-item__info">
                  <strong>{{ getDisplayName(cartItem.item) || 'Item' }}</strong>
                  <span>{{ cartItem.item.price | currency }}</span>
                </div>
                <div class="cart-item__controls">
                  <div class="qty-stepper">
                    <button (click)="changeQuantity(cartItem.menuItemId, -1)">-</button>
                    <span>{{ cartItem.quantity }}</span>
                    <button (click)="changeQuantity(cartItem.menuItemId, 1)">+</button>
                  </div>
                  <button type="button" class="remove-btn" (click)="removeFromCart(cartItem.menuItemId)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <textarea [(ngModel)]="cartItem.notes" rows="1" [placeholder]="t('itemNotesPlaceholder')"></textarea>
              </div>
            </div>
          </div>

          <div class="order-form">
            <div class="form-group">
              <label>{{ t('customerName') }}</label>
              <input [(ngModel)]="orderForm.customerName" [placeholder]="t('customerPlaceholder')">
            </div>
            <div class="form-group">
              <label>{{ t('orderNotes') }}</label>
              <textarea [(ngModel)]="orderForm.notes" rows="2" [placeholder]="t('orderNotesPlaceholder')"></textarea>
            </div>
          </div>

          <div class="cart-footer">
            <div class="total-box">
              <span class="label">{{ t('total') }}</span>
              <span class="amount">{{ cartTotal | currency }}</span>
            </div>
            <button type="button" class="checkout-btn" [disabled]="isSubmittingOrder" (click)="submitOrder()">
              {{ isSubmittingOrder ? t('submitting') : t('placeOrder') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Notification -->
      <div class="notification-toast" *ngIf="notification.message" [class.notification-toast--error]="notification.type === 'error'">
        <i class="bi" [class.bi-check-circle]="notification.type === 'success'" [class.bi-exclamation-circle]="notification.type === 'error'"></i>
        {{ notification.message }}
      </div>

      <!-- Custom Prompt Modal (Table Selection) -->
      <div class="modal-overlay" *ngIf="isTableModalOpen" (click)="closeTableModal()">
        <div class="modal-card modal-card--small animate-slide-up" (click)="$event.stopPropagation()">
          <div class="modal-card__body p-4 text-center">
            <div class="section-tag mb-2">{{ t('tableLabel') }}</div>
            <h3 class="mb-3">{{ t('enterTableNumber') || 'მიუთითეთ მაგიდის ნომერი' }}</h3>
            <input 
              type="text" 
              [(ngModel)]="tempTableLabel" 
              [placeholder]="t('tablePlaceholder')" 
              class="form-control form-control-lg rounded-3 mb-3 text-center border-primary shadow-sm"
              #tableInput>
            <div class="d-flex gap-2">
              <button class="btn btn-light rounded-pill flex-grow-1" (click)="closeTableModal()">{{ t('back') }}</button>
              <button class="btn btn-primary rounded-pill flex-grow-1" (click)="confirmTable()" [disabled]="!tempTableLabel.trim()">
                {{ t('confirm') || 'დადასტურება' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Footer -->
      <footer class="app-footer">
        <p>Powered by growfy</p>
      </footer>
    </div>

  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
    @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

    :host {
      display: block;
      min-height: 100vh;
      background: white;
      color: #0f172a;
      font-family: 'Outfit', sans-serif;
    }

    .app-footer {
      text-align: center;
      padding: 3rem 1rem 6rem 1rem; /* Extra bottom padding for FAB clearance */
      color: #0d6efd; /* Blue color */
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .app-footer p {
      margin: 0;
      opacity: 0.8;
    }

    /* Reviews Section */
    .review-section {
      padding: 2rem 1.5rem;
      text-align: center;
      background: #f8fafc;
      margin: 1rem auto 3rem;
      border-radius: 16px;
      max-width: 600px;
    }

    @media (min-width: 768px) {
      .review-section { max-width: 800px; margin: 1rem auto 3rem; }
    }
    @media (min-width: 1200px) {
      .review-section { max-width: 1100px; }
    }

    .review-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 1.25rem;
    }

    .review-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
    }

    @media (min-width: 480px) {
      .review-buttons { flex-direction: row; justify-content: center; }
    }

    .review-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem 1.25rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
      width: 100%;
      max-width: 250px;
    }

    .review-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .review-btn--google {
      background: #ffffff;
      color: #3c4043;
      border: 1px solid #dadce0;
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
      font-weight: 600;
    }

    .review-btn--google:hover {
      background: #f8f9fa;
      box-shadow: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
      transform: translateY(-2px);
    }

    .review-btn--google svg {
      margin-right: 2px;
    }

    .review-btn--tripadvisor {
      background: #ffffff;
      color: #3c4043;
      border: 1px solid #dadce0;
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
      font-weight: 600;
    }

    .review-btn--tripadvisor:hover {
      background: #f8f9fa;
      box-shadow: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
      transform: translateY(-2px);
    }

    .review-btn--tripadvisor svg {
      margin-right: 4px;
    }

    /* Hero & Header */
    .hero {
      position: relative;
      height: 220px;
    }

    .hero__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%);
    }

    .hero__content {
      position: absolute;
      bottom: 1.5rem;
      left: 1.5rem;
      color: white;
    }

    .hero__content h1 { margin: 0; font-size: 2rem; font-weight: 800; }
    .hero__content p { margin: 0.25rem 0 0; opacity: 0.8; font-size: 0.9rem; }

    .hero__languages {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .chip {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .chip--active { background: white; color: black; }

    /* Content Area */
    .content {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding-bottom: 5rem;
    }

    @media (min-width: 768px) {
      .content { max-width: 800px; }
    }
    @media (min-width: 1200px) {
      .content { max-width: 1100px; }
    }

    .panel {
      padding: 2rem 1.5rem;
      text-align: center;
    }

    .section-tag {
      color: #6366f1;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
    }

    .category-nav {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #f1f5f9;
      transition: all 0.3s ease;
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden;
    }

    .category-nav__wrapper {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
      gap: 0.5rem;
      width: 100%;
      max-width: 100%;
    }

    .search-toggle {
      background: #f8fafc;
      border: 0;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      flex-shrink: 0;
    }

    .search-box {
      width: 0;
      overflow: hidden;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
      opacity: 0;
    }

    .search-box--open {
      width: 100%;
      opacity: 1;
    }

    .search-input {
      width: 100%;
      background: #f1f5f9;
      border: 0;
      padding: 0.6rem 1rem;
      border-radius: 12px;
      font-family: inherit;
      font-size: 0.95rem;
    }

    .category-nav__scroll {
      flex: 1;
      min-width: 0;
      max-width: 100%;
      display: flex;
      overflow-x: auto;
      gap: 1.5rem;
      padding: 0.25rem 0;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }
    .category-nav__scroll::-webkit-scrollbar { display: none; }

    .category-nav__link {
      background: transparent;
      border: 0;
      padding: 0.5rem 0;
      color: #71717a;
      font-weight: 600;
      font-size: 0.95rem;
      font-family: inherit;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
      flex-shrink: 0;
    }

    .category-nav__link--active {
      color: #6366f1;
      border-bottom-color: #6366f1;
    }

    /* Menu Sections */
    .menu-sections {
      padding: 0 1rem;
    }

    .menu-section {
      padding-top: 4rem;
      margin-top: -3rem;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 1rem;
    }

    .menu-section:last-child { border-bottom: 0; }

    .menu-section__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 0 1rem;
      cursor: pointer;
    }

    .menu-section__title {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0;
    }

    .menu-section__chevron {
      font-size: 1.2rem;
      color: #94a3b8;
      transition: transform 0.3s ease;
    }

    .menu-section__chevron--collapsed {
      transform: rotate(-90deg);
      color: #6366f1;
    }

    .menu-section__content {
      overflow: hidden;
      max-height: 2000px; /* High enough to contain items */
      transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out;
      opacity: 1;
    }

    .menu-section__content--collapsed {
      max-height: 0;
      opacity: 0;
      pointer-events: none;
    }

    /* Grid - Exactly 2 Columns */
    .item-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    @media (min-width: 768px) {
      .item-grid { 
        gap: 1.5rem; 
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }
    }

    /* Premium Card (Reference Look) */
    .premium-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      border: 0;
      display: flex;
      flex-direction: column;
    }

    .premium-card__image-container {
      position: relative;
      width: 100%;
      height: 180px; /* Fixed height for absolute consistency */
      background: #f8fafc;
      overflow: hidden;
    }

    .premium-card__image-container img,
    .premium-card__model {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .premium-card__add-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: white;
      border: 0;
      color: #6366f1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .premium-card__content {
      padding: 0.75rem;
      flex-grow: 1;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
    }

    .premium-card__price {
      color: #6366f1;
      font-weight: 700;
      font-size: 0.95rem;
      margin-top: auto;
      padding-top: 0.5rem;
    }

    .premium-card__title {
      margin: 0.25rem 0 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #18181b;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.5rem; 
      max-height: 2.5rem;
    }

    .premium-card__subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.8rem;
      color: #71717a;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 1.1rem;
      max-height: 1.1rem;
    }

    /* Global Actions */
    .global-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 1.5rem 1rem;
    }

    .waiter-button {
      flex: 1;
      min-width: 120px;
      background: #fef2f2;
      color: #ef4444;
      border: 1px solid #fee2e2;
      padding: 0.75rem;
      border-radius: 12px;
      font-weight: 700;
      font-family: inherit;
      white-space: normal;
      word-break: normal;
      font-size: 0.95rem;
    }

    .view-3d-btn--card {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #e0e7ff;
      color: #4338ca;
      border: 0;
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      cursor: pointer;
      width: fit-content;
    }

    .view-3d-btn--modal {
      width: 100%;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      padding: 0.8rem;
      border-radius: 12px;
      font-weight: 700;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-3d-btn--modal:hover {
      background: #e2e8f0;
    }

    /* Cart FAB */
    .cart-fab {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: #18181b;
      color: white;
      padding: 0.6rem 1.25rem;
      border-radius: 99px;
      display: flex;
      align-items: center;
      gap: 1rem;
      font-family: inherit;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
      z-index: 1000;
      border: 0;
      cursor: pointer;
    }

    .cart-fab__info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 99px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .cart-count { background: #6366f1; padding: 0 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: 800; }
    .cart-total { font-weight: 700; font-size: 0.9rem; }
    .cart-fab__label { font-weight: 700; font-size: 0.95rem; letter-spacing: -0.01em; }
    /* Modals & Overlays */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      transition: all 0.3s ease;
    }

    .modal-overlay--bottom {
      align-items: flex-end;
      padding: 0;
    }

    /* Item Details Modal */
    .modal-card {
      width: 100%;
      max-width: 450px;
      background: white;
      border-radius: 24px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .modal-card--small {
      max-width: 350px;
    }

    .notification-toast {
      position: fixed;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 99px;
      z-index: 11000;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .notification-toast--error {
      background: #ef4444;
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
    }
    
    @keyframes toastIn {
      from { transform: translate(-50%, -20px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }

    .modal-card__media {
      height: 300px;
      background: #f8fafc;
    }

    .modal-card__media img, .modal-card__model {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .modal-card__close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 36px;
      height: 36px;
      background: rgba(255,255,255,0.9);
      border: 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      z-index: 10;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }

    .modal-card__body { padding: 2rem; }

    .primary-button {
      width: 100%;
      background: #6366f1;
      color: white;
      border: 0;
      padding: 1rem;
      border-radius: 12px;
      font-weight: 700;
      font-family: inherit;
      margin-top: 1.5rem;
    }

    /* Cart Sheet (Bottom Sheet) */
    .cart-sheet {
      width: 100%;
      max-width: 500px;
      background: white;
      border-radius: 32px 32px 0 0;
      padding: 2rem;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 -10px 25px -5px rgba(0,0,0,0.1);
      animation: slideUp 0.4s cubic-bezier(0, 0.55, 0.45, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .cart-sheet__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .cart-sheet__header h3 { margin: 0; font-size: 1.5rem; font-weight: 800; }
    
    .section-tag {
      background: #eff6ff;
      color: #3b82f6;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
      display: inline-block;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      background: #f1f5f9;
      border: 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 1.25rem;
    }

    /* Cart Items */
    .cart-body {
      overflow-y: auto;
      flex-grow: 1;
      margin: 0 -1rem; /* Negative margin to let content breathe but scrollbar be on edge if needed */
      padding: 0 1rem;
    }

    .cart-item {
      padding: 1.25rem 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .cart-item:last-child { border-bottom: 0; }

    .cart-item__info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .cart-item__info strong { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .cart-item__info span { color: #6366f1; font-weight: 800; }

    .cart-item__controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .qty-stepper {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      background: #f8fafc;
      padding: 0.4rem 0.8rem;
      border-radius: 99px;
    }

    .qty-stepper button {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 0;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      color: #1e293b;
      font-weight: 800;
      cursor: pointer;
    }

    .qty-stepper span { font-weight: 800; min-width: 20px; text-align: center; }

    .remove-btn {
      background: #fef2f2;
      color: #ef4444;
      border: 0;
      width: 36px;
      height: 36px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    textarea {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.75rem;
      margin-top: 0.75rem;
      font-family: inherit;
      font-size: 0.9rem;
      resize: none;
    }

    /* Order Form */
    .order-form {
      padding: 1.5rem 0;
      border-top: 1px solid #f1f5f9;
    }

    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; }
    .form-group input {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.85rem;
      font-family: inherit;
    }

    /* Cart Footer */
    .total-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .total-box .label { font-size: 1.1rem; font-weight: 600; color: #64748b; }
    .total-box .amount { font-size: 1.75rem; font-weight: 800; color: #1e293b; }

    .checkout-btn {
      width: 100%;
      background: #18181b;
      color: white;
      padding: 1.25rem;
      border: 0;
      border-radius: 16px;
      font-weight: 800;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class ObjectDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  isCallingWaiter = false;
  isRequestingBill = false;
  isTabsElevated = false;
  activeCategoryId: string | null = null;
  private observer?: IntersectionObserver;
  private isManualScrolling = false;
  collapsedCategories: Set<string> = new Set();
  private visibleCategoryIds = new Set<string>();
  object: any;
  menus: any[] = [];
  selectedMenu: any;
  items: any[] = [];
  selectedItem: any = null;
  activeLanguages: LanguageCode[] = [];
  selectedLanguage: LanguageCode | null = 'ka';
  cart: CartItem[] = [];
  isCartOpen = false;
  isSubmittingOrder = false;
  searchQuery = '';
  isSearchOpen = false;
  orderError = '';
  orderSuccess = '';
  apiUrl = environment.baseUrl;

  notification = { message: '', type: 'success' as 'success' | 'error' | null };
  isTableModalOpen = false;
  tempTableLabel = '';
  private tableModalAction: 'waiter' | 'bill' | 'order' | null = null;

  @ViewChild('itemModelViewer') itemModelViewer!: ElementRef;
  orderForm = {
    customerName: '',
    tableLabel: '',
    notes: ''
  };
  isTableFromUrl = false;

  private readonly uiText: Record<LanguageCode, Record<string, string>> = {
    ka: {
      chooseLanguage: 'აირჩიე ენა',
      chooseCategory: 'მოძებნე კერძი',
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
      callWaiter: 'მიმტანი',
      requestBill: 'ანგარიში',
      rateUs: 'მოგვეცით შეფასება',
      leaveReview: 'დატოვეთ შეფასება',
      leaveGoogleReview: 'შეაფასეთ Google-ზე',
      leaveTripAdvisorReview: 'შეაფასეთ TripAdvisor-ზე',
      viewIn3D: '3D-ში ნახვა',
      waiterCalledSuccess: 'მიმტანი გამოძახებულია!',
      enterTableNumber: 'მიუთითეთ მაგიდის ნომერი',
      confirm: 'დადასტურება'
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
      requestBill: 'Request Bill',
      rateUs: 'Rate Us',
      leaveReview: 'Leave a Review',
      leaveGoogleReview: 'Review on Google',
      leaveTripAdvisorReview: 'Review on TripAdvisor',
      viewIn3D: 'View in 3D',
      waiterCalledSuccess: 'Waiter called!',
      enterTableNumber: 'Enter Table Number',
      confirm: 'Confirm'
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
      requestBill: 'Заказать счет',
      rateUs: 'Оцените нас',
      leaveReview: 'Оставить отзыв',
      leaveGoogleReview: 'Отзыв на Google',
      leaveTripAdvisorReview: 'Отзыв на TripAdvisor',
      viewIn3D: 'Посмотреть в 3D',
      waiterCalledSuccess: 'Официант вызван!',
      enterTableNumber: 'Укажите номер стола',
      confirm: 'Подтвердить'
    },
  };

  constructor(private route: ActivatedRoute, private api: ApiService) { }

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
      // Fetch all items for all menus immediately to support single-page scroll
      this.menus.forEach(menu => {
        this.api.get(`/public/menus/${menu.id}/items`).subscribe(itemRes => {
          this.items = itemRes.resultData || [];
          menu.items = [...this.items].sort((a: any, b: any) => {
            // Prioritize items with images
            if (a.imageUrl && !b.imageUrl) return -1;
            if (!a.imageUrl && b.imageUrl) return 1;
            return a.sortOrder - b.sortOrder;
          });
        });
      });
    });
  }

  ngAfterViewInit() {
    this.syncStickyState();
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
    this.observer?.disconnect();
  }

  selectLanguage(language: LanguageCode) {
    this.selectedLanguage = language;
  }

  scrollToCategory(menuId: string) {
    const element = document.getElementById(`category-${menuId}`);
    if (element) {
      this.isManualScrolling = true;
      this.activeCategoryId = menuId;

      const headerOffset = 100; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Reset manual scrolling flag after animation
      setTimeout(() => {
        this.isManualScrolling = false;
      }, 1000);
    }
  }

  private initScrollSpy() {
    if (this.observer) this.observer.disconnect();

    this.observer = new IntersectionObserver((entries) => {
      if (this.isManualScrolling) return;

      entries.forEach(entry => {
        const id = entry.target.id.replace('category-', '');
        if (entry.isIntersecting) {
          this.visibleCategoryIds.add(id);
        } else {
          this.visibleCategoryIds.delete(id);
        }
      });

      if (this.visibleCategoryIds.size > 0) {
        const activeItem = this.menus.find(m => this.visibleCategoryIds.has(m.id));

        if (activeItem && activeItem.id !== this.activeCategoryId) {
          this.activeCategoryId = activeItem.id;
          this.scrollActiveChipIntoView();
        }
      }
    }, {
      rootMargin: '-110px 0px -75% 0px',
      threshold: [0, 0.01]
    });

    this.menus.forEach(menu => {
      const el = document.getElementById(`category-${menu.id}`);
      if (el) this.observer?.observe(el);
    });
  }

  private scrollActiveChipIntoView() {
    setTimeout(() => {
      const container = document.querySelector('.category-nav__scroll');
      const activeLink = document.querySelector('.category-nav__link--active') as HTMLElement;

      if (container && activeLink) {
        const containerWidth = container.clientWidth;
        const linkLeft = activeLink.offsetLeft;
        const linkWidth = activeLink.clientWidth;

        // Calculate the scroll position to center the active link
        const targetScrollLeft = linkLeft - (containerWidth / 2) + (linkWidth / 2);

        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }, 0);
  }

  ngAfterViewChecked() {
    // Re-init observer if menus are loaded and observer is not set
    if (this.menus.length > 0 && !this.observer && this.selectedLanguage) {
      this.initScrollSpy();
    }
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

  activateAR(viewer?: any) {
    const target = viewer?.nativeElement || viewer || this.itemModelViewer?.nativeElement;
    if (target && typeof target.activateAR === 'function') {
      target.activateAR();
    }
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
    console.log('callWaiter triggered');
    if (!this.object) {
      console.error('Object not loaded');
      return;
    }

    if (!this.orderForm.tableLabel || !this.orderForm.tableLabel.trim()) {
      console.log('Opening table modal for waiter');
      this.openTableModal('waiter');
      return;
    }

    this.isCallingWaiter = true;
    this.api.post(`/public/objects/${this.object.id}/waiter`, {
      tableLabel: this.orderForm.tableLabel
    }).subscribe({
      next: () => {
        this.isCallingWaiter = false;
        this.showNotification(this.t('waiterCalledSuccess') || 'მიმტანი გამოძახებულია!');
      },
      error: (err) => {
        this.isCallingWaiter = false;
        console.error('Waiter call failed', err);
        this.showNotification(err.message || 'Error', 'error');
      }
    });
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) {
      this.searchQuery = '';
    }
  }

  toggleCategory(menuId: string) {
    if (this.collapsedCategories.has(menuId)) {
      this.collapsedCategories.delete(menuId);
    } else {
      this.collapsedCategories.add(menuId);
    }
  }

  isCategoryCollapsed(menuId: string): boolean {
    return this.collapsedCategories.has(menuId);
  }

  requestBill() {
    console.log('requestBill triggered');
    if (!this.object) {
      console.error('Object not loaded');
      return;
    }

    if (!this.orderForm.tableLabel || !this.orderForm.tableLabel.trim()) {
      console.log('Opening table modal for bill');
      this.openTableModal('bill');
      return;
    }

    this.isRequestingBill = true;
    this.api.post(`/public/objects/${this.object.id}/bill`, {
      tableLabel: this.orderForm.tableLabel
    }).subscribe({
      next: () => {
        this.isRequestingBill = false;
        const msg = this.selectedLanguage === 'ka' ? 'ანგარიში მოთხოვილია!' :
          this.selectedLanguage === 'ru' ? 'Счет запрошен!' :
            'Bill requested!';
        this.showNotification(msg);
      },
      error: (err) => {
        this.isRequestingBill = false;
        console.error('Bill request failed', err);
        this.showNotification(err.message || 'Error', 'error');
      }
    });
  }

  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = { message: '', type: null };
    }, 3000);
  }

  openTableModal(action: 'waiter' | 'bill' | 'order') {
    this.tableModalAction = action;
    this.tempTableLabel = '';
    this.isTableModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeTableModal() {
    this.isTableModalOpen = false;
    this.tableModalAction = null;
    document.body.style.overflow = '';
  }

  confirmTable() {
    if (this.tempTableLabel.trim()) {
      this.orderForm.tableLabel = this.tempTableLabel.trim();
      const action = this.tableModalAction;
      this.closeTableModal();
      if (action === 'waiter') this.callWaiter();
      if (action === 'bill') this.requestBill();
      if (action === 'order') this.submitOrder();
    }
  }

  submitOrder() {
    if (!this.object?.id || this.cart.length === 0) {
      return;
    }

    if (!this.orderForm.tableLabel.trim()) {
      this.openTableModal('order');
      return;
    }

    this.isSubmittingOrder = true;

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
        this.showNotification(this.t('orderPlaced') || 'შეკვეთა გაგზავნილია!');
        this.cart = [];
        this.orderForm = { customerName: '', tableLabel: '', notes: '' };

        setTimeout(() => {
          this.closeCart();
        }, 2000);
      },
      error: (error) => {
        this.isSubmittingOrder = false;
        const errorMsg = error?.error?.errors?.[0] || error?.message || 'Order submission failed.';
        this.showNotification(errorMsg, 'error');
      }
    });
  }

  get cartItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get filteredMenus() {
    if (!this.searchQuery.trim()) return this.menus;

    const query = this.searchQuery.toLowerCase().trim();
    return this.menus.map(menu => {
      const menuName = this.getDisplayName(menu).toLowerCase();
      const isMenuMatch = menuName.includes(query);

      // If category matches, show all its items. Otherwise, filter items.
      const filteredItems = isMenuMatch
        ? menu.items
        : menu.items.filter((item: any) => {
          const name = this.getDisplayName(item).toLowerCase();
          const desc = this.getDisplayDescription(item).toLowerCase();
          return name.includes(query) || desc.includes(query);
        });

      return { ...menu, items: filteredItems };
    }).filter(menu => menu.items.length > 0);
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

    const defaultValue = entity[this.lowercaseFirst(baseKey)] ?? entity[baseKey] ?? '';
    const languageKey = this.getLanguageKey(baseKey);
    const localizedValue = languageKey ? (entity[languageKey] || entity[this.lowercaseFirst(languageKey as string)]) : '';

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
