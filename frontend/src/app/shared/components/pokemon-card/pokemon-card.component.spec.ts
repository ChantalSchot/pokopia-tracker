import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PokemonCardComponent } from './pokemon-card.component';
import { PokemonResponse } from '@core/models';
import { environment } from '@env';

describe('PokemonCardComponent', () => {
  let component: PokemonCardComponent;
  let fixture: ComponentFixture<PokemonCardComponent>;

  const mockPokemon: PokemonResponse = {
    id: 'poke-1',
    number: '#025',
    name: 'Pikachu',
    idealHabitat: 'WARM',
    litterDrop: null,
    rarity: 'Common',
    isEvent: false,
    isDitto: false,
    spritePath: 'assets/sprites/025.png',
    types: ['Electric'],
    regions: ['Palette Town'],
    timeOfDay: ['Day', 'Night'],
    specialties: [],
    favourites: []
  };

  const mockEventPokemon: PokemonResponse = {
    ...mockPokemon,
    id: 'poke-2',
    number: '#150',
    name: 'Mewtwo',
    isEvent: true,
    types: ['Psychic'],
    specialties: [
      { id: 'spec-1', name: 'Telekinesis', description: 'Moves objects with mind', imagePath: 'assets/specialties/telekinesis.png' }
    ]
  };

  const mockMultiTypePokemon: PokemonResponse = {
    ...mockPokemon,
    id: 'poke-3',
    number: '#006',
    name: 'Charizard',
    types: ['Fire', 'Flying']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonCardComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonCardComponent);
    component = fixture.componentInstance;
    component.pokemon = mockPokemon;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering pokemon info', () => {
    it('should display the pokemon name', () => {
      const nameEl = fixture.debugElement.query(By.css('.pokemon-name'));
      expect(nameEl.nativeElement.textContent.trim()).toBe('Pikachu');
    });

    it('should display the pokemon number', () => {
      const numberEl = fixture.debugElement.query(By.css('.pokemon-number'));
      expect(numberEl.nativeElement.textContent.trim()).toBe('#025');
    });

    it('should display pokemon types as chips', () => {
      const typeChips = fixture.debugElement.queryAll(By.css('.type-chip'));
      expect(typeChips.length).toBe(1);
      expect(typeChips[0].nativeElement.textContent.trim()).toBe('Electric');
    });

    it('should display multiple types for multi-type pokemon', () => {
      component.pokemon = mockMultiTypePokemon;
      fixture.detectChanges();

      const typeChips = fixture.debugElement.queryAll(By.css('.type-chip'));
      expect(typeChips.length).toBe(2);
      expect(typeChips[0].nativeElement.textContent.trim()).toBe('Fire');
      expect(typeChips[1].nativeElement.textContent.trim()).toBe('Flying');
    });

    it('should set aria-label on the card', () => {
      const card = fixture.debugElement.query(By.css('.pokemon-card'));
      expect(card.nativeElement.getAttribute('aria-label')).toBe('Pikachu card');
    });

    it('should render sprite image with correct src', () => {
      const img = fixture.debugElement.query(By.css('.sprite-container img'));
      expect(img.nativeElement.getAttribute('src')).toBe(`${environment.apiUrl}/assets/sprites/025.png`);
    });

    it('should render sprite image with correct alt text', () => {
      const img = fixture.debugElement.query(By.css('.sprite-container img'));
      expect(img.nativeElement.getAttribute('alt')).toBe('Pikachu sprite');
    });
  });

  describe('event badge', () => {
    it('should not show event badge for non-event pokemon', () => {
      const eventBadge = fixture.debugElement.query(By.css('.event-badge'));
      expect(eventBadge).toBeNull();
    });

    it('should show event badge for event pokemon', () => {
      component.pokemon = mockEventPokemon;
      fixture.detectChanges();

      const eventBadge = fixture.debugElement.query(By.css('.event-badge'));
      expect(eventBadge).toBeTruthy();
      expect(eventBadge.nativeElement.textContent.trim()).toBe('star');
    });
  });

  describe('specialties', () => {
    it('should not show specialties section when empty', () => {
      const specialties = fixture.debugElement.query(By.css('.specialties'));
      expect(specialties).toBeNull();
    });

    it('should show specialties when present', () => {
      component.pokemon = mockEventPokemon;
      fixture.detectChanges();

      const specialties = fixture.debugElement.query(By.css('.specialties'));
      expect(specialties).toBeTruthy();

      const icons = fixture.debugElement.queryAll(By.css('.specialty-icon'));
      expect(icons.length).toBe(1);
      expect(icons[0].nativeElement.getAttribute('alt')).toBe('Telekinesis');
    });
  });

  describe('registered state', () => {
    it('should not have registered class by default', () => {
      const card = fixture.debugElement.query(By.css('.pokemon-card'));
      expect(card.nativeElement.classList.contains('registered')).toBeFalse();
    });

    it('should add registered class when registered is true', () => {
      component.registered = true;
      fixture.detectChanges();

      const card = fixture.debugElement.query(By.css('.pokemon-card'));
      expect(card.nativeElement.classList.contains('registered')).toBeTrue();
    });

    it('should show registered badge when registered', () => {
      component.registered = true;
      fixture.detectChanges();

      const badge = fixture.debugElement.query(By.css('.registered-badge'));
      expect(badge).toBeTruthy();
      expect(badge.nativeElement.textContent.trim()).toBe('check_circle');
    });

    it('should not show registered badge when not registered', () => {
      const badge = fixture.debugElement.query(By.css('.registered-badge'));
      expect(badge).toBeNull();
    });
  });

  describe('homeless state', () => {
    it('should not have homeless class by default', () => {
      const card = fixture.debugElement.query(By.css('.pokemon-card'));
      expect(card.nativeElement.classList.contains('homeless')).toBeFalse();
    });

    it('should add homeless class when homeless is true', () => {
      component.homeless = true;
      fixture.detectChanges();

      const card = fixture.debugElement.query(By.css('.pokemon-card'));
      expect(card.nativeElement.classList.contains('homeless')).toBeTrue();
    });
  });

  describe('warning state', () => {
    it('should not have warning class by default', () => {
      const card = fixture.debugElement.query(By.css('.pokemon-card'));
      expect(card.nativeElement.classList.contains('warning')).toBeFalse();
    });

    it('should add warning class when warning is true', () => {
      component.warning = true;
      fixture.detectChanges();

      const card = fixture.debugElement.query(By.css('.pokemon-card'));
      expect(card.nativeElement.classList.contains('warning')).toBeTrue();
    });

    it('should show warning badge when warning is true', () => {
      component.warning = true;
      fixture.detectChanges();

      const badge = fixture.debugElement.query(By.css('.warning-badge'));
      expect(badge).toBeTruthy();
      expect(badge.nativeElement.textContent.trim()).toBe('warning');
    });

    it('should not show warning badge when warning is false', () => {
      const badge = fixture.debugElement.query(By.css('.warning-badge'));
      expect(badge).toBeNull();
    });
  });

  describe('action buttons', () => {
    it('should not show action buttons by default', () => {
      const actions = fixture.debugElement.query(By.css('mat-card-actions'));
      expect(actions).toBeNull();
    });

    it('should show Register button when showActions is true and not registered', () => {
      component.showActions = true;
      component.registered = false;
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('mat-card-actions button'));
      expect(buttons.length).toBe(1);
      expect(buttons[0].nativeElement.textContent.trim()).toBe('Register');
    });

    it('should show Unregister button when showActions is true and registered', () => {
      component.showActions = true;
      component.registered = true;
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('mat-card-actions button'));
      expect(buttons.length).toBe(1);
      expect(buttons[0].nativeElement.textContent.trim()).toBe('Unregister');
    });

    it('should emit register event when Register button is clicked', () => {
      component.showActions = true;
      component.registered = false;
      fixture.detectChanges();

      spyOn(component.register, 'emit');

      const button = fixture.debugElement.query(By.css('mat-card-actions button'));
      button.nativeElement.click();

      expect(component.register.emit).toHaveBeenCalledWith(mockPokemon);
    });

    it('should emit unregister event when Unregister button is clicked', () => {
      component.showActions = true;
      component.registered = true;
      fixture.detectChanges();

      spyOn(component.unregister, 'emit');

      const button = fixture.debugElement.query(By.css('mat-card-actions button'));
      button.nativeElement.click();

      expect(component.unregister.emit).toHaveBeenCalledWith(mockPokemon);
    });

    it('should have correct aria-label on Register button', () => {
      component.showActions = true;
      component.registered = false;
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('mat-card-actions button'));
      expect(button.nativeElement.getAttribute('aria-label')).toBe('Register Pikachu');
    });

    it('should have correct aria-label on Unregister button', () => {
      component.showActions = true;
      component.registered = true;
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('mat-card-actions button'));
      expect(button.nativeElement.getAttribute('aria-label')).toBe('Unregister Pikachu');
    });
  });

  describe('type colors', () => {
    it('should apply correct color for Electric type', () => {
      const typeChip = fixture.debugElement.query(By.css('.type-chip'));
      expect(typeChip.nativeElement.style.backgroundColor).toBeTruthy();
      // #F8D030 converts to rgb(248, 208, 48)
      expect(component.getTypeColor('Electric')).toBe('#F8D030');
    });

    it('should apply correct color for Fire type', () => {
      expect(component.getTypeColor('Fire')).toBe('#F08030');
    });

    it('should apply correct color for Water type', () => {
      expect(component.getTypeColor('Water')).toBe('#6890F0');
    });

    it('should apply correct color for Grass type', () => {
      expect(component.getTypeColor('Grass')).toBe('#78C850');
    });

    it('should apply correct color for Psychic type', () => {
      expect(component.getTypeColor('Psychic')).toBe('#F85888');
    });

    it('should apply correct color for Dragon type', () => {
      expect(component.getTypeColor('Dragon')).toBe('#7038F8');
    });

    it('should return default color for unknown type', () => {
      expect(component.getTypeColor('Unknown')).toBe('#A8A878');
    });

    it('should apply background color to type chips in template', () => {
      component.pokemon = mockMultiTypePokemon;
      fixture.detectChanges();

      const typeChips = fixture.debugElement.queryAll(By.css('.type-chip'));
      // Fire type chip
      expect(typeChips[0].nativeElement.style.backgroundColor).toBeTruthy();
      // Flying type chip
      expect(typeChips[1].nativeElement.style.backgroundColor).toBeTruthy();
    });
  });

  describe('getAssetUrl', () => {
    it('should construct full URL from relative path', () => {
      expect(component.getAssetUrl('assets/sprites/025.png'))
        .toBe(`${environment.apiUrl}/assets/sprites/025.png`);
    });

    it('should return empty string for empty path', () => {
      expect(component.getAssetUrl('')).toBe('');
    });
  });

  describe('getSpriteSrc', () => {
    it('should return full sprite URL', () => {
      expect(component.getSpriteSrc()).toBe(`${environment.apiUrl}/assets/sprites/025.png`);
    });
  });

  describe('onImageError', () => {
    it('should hide image on error', () => {
      const img = fixture.debugElement.query(By.css('.sprite-container img'));
      const event = new Event('error');
      Object.defineProperty(event, 'target', { value: img.nativeElement });

      component.onImageError(event);

      expect(img.nativeElement.src).toContain('');
      expect(img.nativeElement.style.display).toBe('none');
    });
  });
});
