import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HouseService } from './house.service';
import { environment } from '@env';
import {
  HouseResponse, PageResponse, CreateHouseRequest, UpdateHouseRequest,
  ChangeHouseRegionRequest, UpdateHouseItemsRequest, HouseSuggestionsResponse,
  FavouriteResponse
} from '../models';

describe('HouseService', () => {
  let service: HouseService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/api/houses`;

  const mockHouse: HouseResponse = {
    id: 'house-1',
    name: 'Pikachu Palace',
    description: 'A cozy home for electric types',
    region: 'Palette Town',
    houseType: 'HABITAT',
    idealHabitat: 'WARM',
    width: 10,
    depth: 10,
    height: 5,
    capacity: 4,
    occupancy: 2,
    housingKit: null,
    habitatRef: null,
    items: [],
    assignedPokemon: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z'
  };

  const mockPageResponse: PageResponse<HouseResponse> = {
    content: [mockHouse],
    totalElements: 1,
    totalPages: 1,
    page: 0,
    size: 10
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HouseService]
    });

    service = TestBed.inject(HouseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should GET all houses with no params', () => {
      service.getAll().subscribe(page => {
        expect(page).toEqual(mockPageResponse);
        expect(page.content.length).toBe(1);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockPageResponse);
    });

    it('should GET houses with query params', () => {
      service.getAll({ page: 0, size: 20, region: 'Palette Town' }).subscribe(page => {
        expect(page).toEqual(mockPageResponse);
      });

      const req = httpMock.expectOne(r =>
        r.url === apiUrl &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '20' &&
        r.params.get('region') === 'Palette Town'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);
    });

    it('should skip null, undefined, and empty string params', () => {
      service.getAll({ page: 0, region: null, name: undefined, search: '' }).subscribe();

      const req = httpMock.expectOne(r => r.url === apiUrl);
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.has('region')).toBeFalse();
      expect(req.request.params.has('name')).toBeFalse();
      expect(req.request.params.has('search')).toBeFalse();
      req.flush(mockPageResponse);
    });
  });

  describe('getById', () => {
    it('should GET a house by ID', () => {
      service.getById('house-1').subscribe(house => {
        expect(house).toEqual(mockHouse);
      });

      const req = httpMock.expectOne(`${apiUrl}/house-1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockHouse);
    });

    it('should handle 404 error', () => {
      service.getById('nonexistent').subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/nonexistent`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should POST a new house', () => {
      const request: CreateHouseRequest = {
        name: 'Pikachu Palace',
        region: 'Palette Town',
        houseType: 'HABITAT',
        description: 'A cozy home for electric types',
        idealHabitat: 'WARM'
      };

      service.create(request).subscribe(house => {
        expect(house).toEqual(mockHouse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockHouse);
    });
  });

  describe('update', () => {
    it('should PUT an updated house', () => {
      const request: UpdateHouseRequest = {
        name: 'Pikachu Palace V2',
        description: 'An upgraded home'
      };

      service.update('house-1', request).subscribe(house => {
        expect(house).toEqual(mockHouse);
      });

      const req = httpMock.expectOne(`${apiUrl}/house-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockHouse);
    });
  });

  describe('delete', () => {
    it('should DELETE a house by ID', () => {
      service.delete('house-1').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/house-1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.withCredentials).toBeTrue();
      req.flush(null);
    });
  });

  describe('changeRegion', () => {
    it('should PUT region change request', () => {
      const request: ChangeHouseRegionRequest = {
        newRegion: 'Cloud Island',
        pokemonIdsToMove: ['poke-1', 'poke-2']
      };

      service.changeRegion('house-1', request).subscribe(house => {
        expect(house).toEqual(mockHouse);
      });

      const req = httpMock.expectOne(`${apiUrl}/house-1/region`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockHouse);
    });
  });

  describe('assignPokemon', () => {
    it('should POST to assign a pokemon to a house', () => {
      service.assignPokemon('house-1', 'poke-1').subscribe(house => {
        expect(house).toEqual(mockHouse);
      });

      const req = httpMock.expectOne(`${apiUrl}/house-1/pokemon/poke-1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockHouse);
    });
  });

  describe('removePokemon', () => {
    it('should DELETE to remove a pokemon from a house', () => {
      service.removePokemon('house-1', 'poke-1').subscribe(house => {
        expect(house).toEqual(mockHouse);
      });

      const req = httpMock.expectOne(`${apiUrl}/house-1/pokemon/poke-1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockHouse);
    });
  });

  describe('updateItems', () => {
    it('should PUT item IDs to update house items', () => {
      const request: UpdateHouseItemsRequest = {
        itemIds: ['item-1', 'item-2', 'item-3']
      };

      service.updateItems('house-1', request).subscribe(house => {
        expect(house).toEqual(mockHouse);
      });

      const req = httpMock.expectOne(`${apiUrl}/house-1/items`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockHouse);
    });
  });

  describe('getSuggestions', () => {
    it('should GET suggestions for a house', () => {
      const mockSuggestions: HouseSuggestionsResponse = {
        suggestions: [],
        availableSlots: 2
      };

      service.getSuggestions('house-1').subscribe(suggestions => {
        expect(suggestions).toEqual(mockSuggestions);
        expect(suggestions.availableSlots).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/house-1/suggestions`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockSuggestions);
    });
  });

  describe('getActiveFavourites', () => {
    it('should GET active favourites for a house', () => {
      const mockFavourites: FavouriteResponse[] = [
        { id: 'fav-1', name: 'Cute', isFlavour: false },
        { id: 'fav-2', name: 'Sweet', isFlavour: true }
      ];

      service.getActiveFavourites('house-1').subscribe(favourites => {
        expect(favourites).toEqual(mockFavourites);
        expect(favourites.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/house-1/active-favourites`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockFavourites);
    });

    it('should return empty array when no active favourites', () => {
      service.getActiveFavourites('house-1').subscribe(favourites => {
        expect(favourites).toEqual([]);
        expect(favourites.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/house-1/active-favourites`);
      req.flush([]);
    });
  });
});
