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
        <!-- Step 1: Language Choice -->
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
                      <img *ngIf="(!item.showAr || !item.modelUrl) && item.imageUrl" [src]="getFullUrl(item.imageUrl)" [alt]="getDisplayName(item)">
                      <div class="premium-card__fallback" *ngIf="!item.imageUrl && !item.modelUrl"></div>
                      
                      <model-viewer
                        *ngIf="item.showAr && item.modelUrl"
                        #cardViewer
                        [src]="getFullUrl(item.modelUrl)"
                        class="premium-card__model"
                        ar
                        ar-modes="webxr scene-viewer quick-look"
                        auto-rotate
                        interaction-prompt="none">
                      </model-viewer>

                      <button type="button" class="premium-card__add-btn" (click)="addToCart(item); $event.stopPropagation()">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                    <div class="premium-card__content" (click)="openItemDetails(item)">
                      <div class="premium-card__price">{{ item.price | currency }}</div>
                      <h3 class="premium-card__title">{{ getDisplayName(item) }}</h3>
                      <p class="premium-card__subtitle" *ngIf="getDisplayDescription(item)">{{ getDisplayDescription(item) }}</p>
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
              camera-controls>
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
      max-width: 600px;
      margin: 0 auto;
      padding-bottom: 5rem;
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

    /* Sticky Nav (Reference Look) */
    .category-nav {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #f1f5f9;
      transition: all 0.3s ease;
    }

    .category-nav__wrapper {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
      gap: 0.5rem;
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
      display: flex;
      overflow-x: auto;
      gap: 1.5rem;
      padding: 0.25rem 0;
      scrollbar-width: none;
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
      border-bottom: 1px solid #f1f5f9;
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
      gap: 1rem;
    }

    /* Premium Card (Reference Look) */
    .premium-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
    }

    .premium-card__image-container {
      position: relative;
      width: 100%;
      aspect-ratio: 1.1 / 1;
      background: #f8fafc;
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
    }

    .premium-card__price {
      color: #6366f1;
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .premium-card__title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #18181b;
      line-height: 1.3;
    }

    .premium-card__subtitle {
      margin: 0.2rem 0 0;
      font-size: 0.8rem;
      color: #71717a;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Global Actions */
    .global-actions {
      display: flex;
      gap: 0.75rem;
      padding: 1.5rem 1rem;
    }

    .waiter-button {
      flex: 1;
      background: #fef2f2;
      color: #ef4444;
      border: 1px solid #fee2e2;
      padding: 0.75rem;
      border-radius: 12px;
      font-weight: 700;
      font-family: inherit;
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
  searchQuery = '';
  isSearchOpen = false;
  orderError = '';
  orderSuccess = '';
  apiUrl = environment.baseUrl;

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
      requestBill: 'ანგარიშის მოთხოვნა',
      rateUs: 'მოგვეცით შეფასება',
      leaveReview: 'დატოვეთ შეფასება',
      leaveTripAdvisorReview: 'შეაფასეთ TripAdvisor-ზე',
      viewIn3D: '3D-ში ნახვა'
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
      leaveTripAdvisorReview: 'Review on TripAdvisor',
      viewIn3D: 'View in 3D'
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
      leaveTripAdvisorReview: 'Отзыв на TripAdvisor',
      viewIn3D: 'Посмотреть в 3D'
    },
  };

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
      // Fetch all items for all menus immediately to support single-page scroll
      this.menus.forEach(menu => {
        this.api.get(`/public/menus/${menu.id}/items`).subscribe(itemRes => {
          menu.items = itemRes.resultData;
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
        if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
          this.activeCategoryId = entry.target.id.replace('category-', '');
          
          // Auto-scroll the chips bar to keep active chip visible
          const activeLink = document.querySelector(`.category-nav__link--active`);
          if (activeLink) {
            activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      });
    }, {
      rootMargin: '-80px 0px -50% 0px',
      threshold: [0.1, 0.5]
    });

    this.menus.forEach(menu => {
      const el = document.getElementById(`category-${menu.id}`);
      if (el) this.observer?.observe(el);
    });
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
    if (!this.object?.id) return;

    const tableLabel = this.orderForm.tableLabel.trim();
    if (!tableLabel) {
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
        alert(this.t('waiterCalledSuccess') || 'Waiter called!');
      },
      error: (err) => {
        this.isCallingWaiter = false;
        alert('Error: ' + (err.message || 'Check connection'));
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
    if (!this.object?.id) {
      return;
    }

    if (!this.orderForm.tableLabel.trim()) {
      const label = prompt(this.t('tableLabel'));
      if (!label || !label.trim()) return;
      this.orderForm.tableLabel = label.trim();
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
        alert(msg);
      },
      error: (err) => {
        this.isRequestingBill = false;
        alert('Error requesting bill: ' + (err.message || JSON.stringify(err)));
        console.error('Bill Request Error:', err);
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

  get filteredMenus() {
    if (!this.searchQuery.trim()) return this.menus;
    
    const query = this.searchQuery.toLowerCase().trim();
    return this.menus.map(menu => {
      const filteredItems = menu.items.filter((item: any) => {
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
