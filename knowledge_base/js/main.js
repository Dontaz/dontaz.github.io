document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.getElementById('burgerMenu');
    const menuOverlay = document.getElementById('menuOverlay');
	const savedPerPage = parseInt(localStorage.getItem('itemsPerPage'), 10);
	
	if (savedPerPage && [6, 12, 24, 48].includes(savedPerPage)) {
		itemsPerPage = savedPerPage;
	}
    
    if (burgerMenu && menuOverlay) {
        burgerMenu.addEventListener('click', function() {
            menuOverlay.classList.remove('hidden');
            setTimeout(() => {
                const menuContent = document.querySelector('.menu-content');
                if (menuContent) {
                    menuContent.classList.add('visible');
                }
            }, 10);
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
	
	resources.forEach((resource, index) => {
		if (!resource.id) {
			resource.id = `resource-${index}`;
		}
	});
    
    initializeModalHandlers();
    initializeFiltersAndSearch();
    
    const urlParams = new URLSearchParams(window.location.search);
    const resourceParam = urlParams.get('resource');
    
    if (resourceParam) {
        const matchedResource = resources.find(resource => {
            const resourceSlug = resource.title
                .toLowerCase()
                .replace(/[^a-zа-яё0-9]/gi, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            return resourceSlug === resourceParam;
        });
        
        if (matchedResource) {
            setTimeout(() => {
                showModal(matchedResource);
            }, 500);
        }
    }
});

function formatDescription(description) {
    return description.replace(
        /\[\[([^\]]+)>>([^\]]+)\]\]/g, 
        '<a href="$2" target="_blank" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">$1</a>'
    );
}

function closeModal() {
    const modal = document.getElementById('resourceModal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}


function initializeModalHandlers() {
    document.getElementById('closeModal').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });

    const modal = document.getElementById('resourceModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

function initializeFiltersAndSearch() {
    const searchInput = document.getElementById('searchInput');
    createFilterMenu();
    
    let currentCategory = 'all';
    let currentSubcategory = null;

    function filterResources() {
		const searchTerm = searchInput.value.toLowerCase();
		const filtered = resources.filter(resource => {
			const matchesSearch = resource.title.toLowerCase().includes(searchTerm) ||
				resource.description.toLowerCase().includes(searchTerm) ||
				resource.author.toLowerCase().includes(searchTerm);
		
			const matchesCategory = currentCategory === 'all' || 
				resource.categories.includes(currentCategory);
		
			const matchesSubcategory = !currentSubcategory || 
				resource.subcategories.includes(currentSubcategory);
		
			return matchesSearch && matchesCategory && matchesSubcategory;
		});
		
		currentPage = 1;
		displayResources(filtered);
	}

    searchInput.addEventListener('input', filterResources);

    document.getElementById('filters').addEventListener('click', (e) => {
		const button = e.target.closest('button');
		if (!button || button.classList.contains('close-modal')) return;

		document.querySelectorAll('.filter-btn').forEach(btn => 
			btn.classList.remove('active'));
		
		if (button.classList.contains('sub-btn')) {
			const parentDropdown = button.closest('.filter-dropdown');
			if (parentDropdown) {
				const mainButton = parentDropdown.querySelector('button:not(.sub-btn)');
				mainButton.classList.add('active');
			}
			button.classList.add('active');
		} else {
			button.classList.add('active');
    }
    
    currentCategory = button.dataset.category;
    currentSubcategory = button.dataset.subcategory || null;
    
    filterResources();
	});

    displayResources(resources);
}

function getResourceTypeIcon(type) {
    switch(type) {
        case 'Учебник':
        case 'Книга':
            return '<i class="fas fa-book"></i>';
        case 'Статья':
        case 'Руководство':
            return '<i class="fas fa-file-alt"></i>';
        case 'Интернет-ресурс':
            return '<i class="fas fa-globe"></i>';
        default:
            return '<i class="fas fa-file-alt"></i>';
    }
}

let currentPage = 1;
let itemsPerPage = 12;
let lastFilteredResources = [];

function displayResources(filteredResources) {
    const resourcesList = document.getElementById('resourcesList');
	
    resourcesList.innerHTML = '';

    lastFilteredResources = filteredResources;

    if (filteredResources.length === 0) {
        resourcesList.innerHTML = `
            <div class="col-span-1 md:col-span-2 lg:col-span-3 py-12 text-center">
                <div class="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <i class="fas fa-search fa-2x text-gray-500 dark:text-gray-400"></i>
                </div>
                <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">Ничего не найдено</h3>
                <p class="text-gray-600 dark:text-gray-400">
                    Попробуйте изменить критерии поиска или выбрать другую категорию
                </p>
            </div>
        `;
        renderPagination(0);
        return;
    }

    const totalPages = Math.max(1, Math.ceil(filteredResources.length / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageResources = filteredResources.slice(startIndex, endIndex);

    const favorites = localStorage.getItem('favorites') ? 
        JSON.parse(localStorage.getItem('favorites')) : 
        [];

    pageResources.forEach((resource) => {
        const categoryNames = resource.categories.map(cat => 
            categories[cat]?.name || cat
        );
        
        const subcategoryNames = resource.subcategories
            .map(sub => {
                for (const cat of resource.categories) {
                    const categorySubcats = categories[cat]?.subcategories;
                    if (categorySubcats && categorySubcats[sub]) {
                        return categorySubcats[sub];
                    }
                }
                return sub;
            });
        
        const card = document.createElement('div');
        
        const isFavorite = resource.id && favorites.includes(resource.id);
        card.className = `resource-card ${isFavorite ? 'favorite' : ''} bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col h-full`;
        
        const shortDescription = resource.description
            .replace(/\[\[([^\]]+)>>([^\]]+)\]\]/g, '$1')
            .split('\n\n')[0];
        
        card.innerHTML = `
            <div class="flex-grow">
                <div class="flex gap-2 items-start mb-3">
                    <div class="resource-type-icon">
                        ${getResourceTypeIcon(resource.type)}
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">${resource.title}</h3>
                        <div class="text-sm text-gray-600 dark:text-gray-400">${resource.type} • ${resource.author}</div>
                    </div>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">${shortDescription}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${categoryNames.map(cat => `
                        <span class="category-tag primary">${cat}</span>
                    `).join('')}
                    ${subcategoryNames.map(sub => `
                        <span class="category-tag secondary">${sub}</span>
                    `).join('')}
                </div>
            </div>
            <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <button class="resource-link w-full py-2 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors duration-200 font-medium">
                    Подробнее
                </button>
            </div>
            ${isFavorite ? '<div class="favorite-indicator"><i class="fas fa-star"></i></div>' : ''}
        `;
        
        if (resource.id) {
            card.dataset.resourceId = resource.id;
        }
        
        const detailsButton = card.querySelector('.resource-link');
        detailsButton.addEventListener('click', () => {
            showModal(resource);
        });
        
        resourcesList.appendChild(card);
    });
    
    if (typeof addFavoriteButtonsToCards === 'function') {
		addFavoriteButtonsToCards();
	}
	renderPagination(filteredResources.length);
}

function getFavorites() {
	const favorites = localStorage.getItem('favorites');
	return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
	localStorage.setItem('favorites', JSON.stringify(favorites));
}

function isFavorite(resourceId) {
	const favorites = getFavorites();
	return favorites.includes(resourceId);
}

function toggleFavorite(resourceId) {
	const favorites = getFavorites();
	const index = favorites.indexOf(resourceId);
	let isNowFavorite;
	
	if (index === -1) {
		favorites.push(resourceId);
		isNowFavorite = true;
	} else {
		favorites.splice(index, 1);
		isNowFavorite = false;
	}
	
	saveFavorites(favorites);
	
	document.querySelectorAll(`.resource-card[data-resource-id="${resourceId}"]`).forEach(card => {
		if (isNowFavorite) {
			card.classList.add('favorite');
			
			if (!card.querySelector('.favorite-indicator')) {
				const indicator = document.createElement('div');
				indicator.className = 'favorite-indicator';
				indicator.innerHTML = '<i class="fas fa-star"></i>';
				card.appendChild(indicator);
			}
		} else {
			card.classList.remove('favorite');
			
			const indicator = card.querySelector('.favorite-indicator');
			if (indicator) {
				indicator.remove();
			}
		}
		
		const favoriteBtn = card.querySelector('.card-favorite-btn');
		if (favoriteBtn) {
			if (isNowFavorite) {
				favoriteBtn.classList.add('active');
			} else {
				favoriteBtn.classList.remove('active');
			}
		}
	});
	
	return isNowFavorite;
}

function addFavoriteButtonsToCards() {
	document.querySelectorAll('.card-favorite-btn').forEach(btn => {
		btn.remove();
	});
	
	document.querySelectorAll('.resource-card').forEach(card => {
		const resourceId = card.dataset.resourceId;
		if (!resourceId) return;
		
		const favBtn = document.createElement('button');
		favBtn.className = 'card-favorite-btn';
		favBtn.dataset.resourceId = resourceId;
		favBtn.dataset.tooltip = isFavorite(resourceId) ? 'Удалить из избранного' : 'Добавить в избранное';
		favBtn.innerHTML = '<i class="fas fa-star"></i>';
		
		if (isFavorite(resourceId)) {
			favBtn.classList.add('active');
			card.classList.add('favorite');
			
			if (!card.querySelector('.favorite-indicator')) {
				const indicator = document.createElement('div');
				indicator.className = 'favorite-indicator';
				indicator.innerHTML = '<i class="fas fa-star"></i>';
				card.appendChild(indicator);
			}
		}
		
		favBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			const isNowFavorite = toggleFavorite(resourceId);
			
			favBtn.dataset.tooltip = isNowFavorite ? 'Удалить из избранного' : 'Добавить в избранное';
			
			if (isNowFavorite) {
				favBtn.classList.add('active');
			} else {
				favBtn.classList.remove('active');
			}
			
			if (isNowFavorite) {
				card.classList.add('favorite');
				
				if (!card.querySelector('.favorite-indicator')) {
					const indicator = document.createElement('div');
					indicator.className = 'favorite-indicator';
					indicator.innerHTML = '<i class="fas fa-star"></i>';
					card.appendChild(indicator);
				}
			} else {
				card.classList.remove('favorite');
				
				const indicator = card.querySelector('.favorite-indicator');
				if (indicator) {
					indicator.remove();
				}
			}
			
			const icon = favBtn.querySelector('i');
			icon.style.transform = 'scale(1.3)';
			setTimeout(() => {
				icon.style.transform = 'scale(1)';
			}, 200);
			
			showNotification(isNowFavorite ? 
				'Добавлено в избранное' : 
				'Удалено из избранного');
		});
		
		card.appendChild(favBtn);
	});
}

function scrollToPagination() {
    requestAnimationFrame(() => {
        const paginationEl = document.getElementById('pagination');
        if (paginationEl) {
            paginationEl.scrollIntoView({ block: 'end', behavior: 'auto' });
        }
    });
}

function renderPagination(totalItems) {
    const paginationEl = document.getElementById('pagination');
    if (!paginationEl) {
        console.warn('Элемент #pagination не найден в HTML');
        return;
    }
    
    paginationEl.innerHTML = '';
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const perPageWrapper = document.createElement('div');
    perPageWrapper.className = 'per-page-wrapper';
    perPageWrapper.innerHTML = `
        <label for="perPageSelect" class="text-sm text-gray-600 dark:text-gray-400 mr-2">На странице:</label>
        <select id="perPageSelect" class="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
        </select>
    `;
    paginationEl.appendChild(perPageWrapper);
    
    const selectEl = perPageWrapper.querySelector('#perPageSelect');
    selectEl.value = itemsPerPage;
    selectEl.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value, 10);
        localStorage.setItem('itemsPerPage', itemsPerPage);
        currentPage = 1;
        displayResources(lastFilteredResources);
        scrollToPagination();
    });
    
    if (totalItems === 0 || totalPages <= 1) {
        return;
    }
    
    const info = document.createElement('div');
    info.className = 'pagination-info';
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    info.textContent = `${startItem}–${endItem} из ${totalItems}`;
    paginationEl.appendChild(info);
    
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.className = 'pagination-buttons';
    
    const createPageBtn = (label, page, opts = {}) => {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        if (opts.active) btn.classList.add('active');
        if (opts.disabled) btn.classList.add('disabled');
        btn.innerHTML = label;
        btn.disabled = !!opts.disabled;
        if (!opts.disabled && !opts.active && page !== null) {
            btn.addEventListener('click', () => {
                currentPage = page;
                displayResources(lastFilteredResources);
                scrollToPagination();
            });
        }
        return btn;
    };
    
    buttonsWrapper.appendChild(createPageBtn(
        '<i class="fas fa-chevron-left"></i>', 
        currentPage - 1, 
        { disabled: currentPage === 1 }
    ));
    
    const pages = getPageNumbers(currentPage, totalPages);
    pages.forEach(p => {
        if (p === '...') {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '…';
            buttonsWrapper.appendChild(dots);
        } else {
            buttonsWrapper.appendChild(createPageBtn(
                String(p),
                p,
                { active: p === currentPage }
            ));
        }
    });
    
    buttonsWrapper.appendChild(createPageBtn(
        '<i class="fas fa-chevron-right"></i>', 
        currentPage + 1, 
        { disabled: currentPage === totalPages }
    ));
    
    paginationEl.appendChild(buttonsWrapper);
    
    const jumpWrapper = document.createElement('div');
    jumpWrapper.className = 'page-jump-wrapper';
    jumpWrapper.innerHTML = `
        <label for="pageJumpInput" class="text-sm text-gray-600 dark:text-gray-400">Перейти:</label>
        <input type="number" id="pageJumpInput" min="1" max="${totalPages}" value="${currentPage}"
            class="page-jump-input px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        <span class="text-sm text-gray-600 dark:text-gray-400">из ${totalPages}</span>
        <button id="pageJumpBtn" class="page-btn" title="Перейти">
            <i class="fas fa-arrow-right"></i>
        </button>
    `;
    paginationEl.appendChild(jumpWrapper);
    
    const jumpInput = jumpWrapper.querySelector('#pageJumpInput');
    const jumpBtn = jumpWrapper.querySelector('#pageJumpBtn');
    
    const goToPage = () => {
        let page = parseInt(jumpInput.value, 10);
        if (isNaN(page)) {
            jumpInput.value = currentPage;
            return;
        }
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        if (page === currentPage) return;
        
        jumpInput.blur();
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        
        currentPage = page;
        displayResources(lastFilteredResources);
        scrollToPagination();
    };
    
    jumpBtn.addEventListener('click', goToPage);
    jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            goToPage();
        }
    });
}

function getPageNumbers(current, total) {
    const delta = 1;
    const range = [];
    const result = [];
    
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i);
    }
    
    result.push(1);
    if (range[0] > 2) result.push('...');
    result.push(...range);
    if (range[range.length - 1] < total - 1) result.push('...');
    if (total > 1) result.push(total);
    
    return result;
}

function showModal(resource) {
    const modal = document.getElementById('resourceModal');

    document.querySelector('.modal-content').innerHTML = `
        <div class="modal-header p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="modal-header-top">
                <div class="pr-8 w-full">
                    <div class="modal-resource-type">
                        <div class="inline-flex p-2 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
                            ${getResourceTypeIcon(resource.type)}
                        </div>
                        <span class="modal-resource-type-badge text-gray-800 dark:text-gray-200">
                            ${resource.type}
                        </span>
                    </div>
                    <h2 id="modalTitle" class="text-2xl font-bold text-gray-900 dark:text-white">${resource.title}</h2>
                </div>
            </div>
        </div>

        <div class="modal-body p-6 max-h-[60vh] overflow-y-auto">
            <div class="resource-details space-y-6">
                <div class="detail-item">
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Автор(-ы)</div>
                    <div id="modalAuthor" class="text-gray-900 dark:text-white">${resource.author}</div>
                </div>
                
                <div class="detail-item">
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Описание</div>
                    <div id="modalDescription" class="text-gray-700 dark:text-gray-300">
                        ${formatDescription(resource.description).replace(/\n\n/g, '<br><br>')}
                    </div>
                </div>
                
                <div class="detail-item categories">
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Категории</div>
                    <div id="modalCategories" class="flex flex-wrap gap-2">
                        ${resource.categories.map(cat => `
                            <span class="category-tag primary">
                                ${categories[cat]?.name || cat}
                            </span>
                        `).join('')}
                        ${resource.subcategories.map(sub => {
                            let subName = sub;
                            for (const cat of resource.categories) {
                                const categorySubcats = categories[cat]?.subcategories;
                                if (categorySubcats && categorySubcats[sub]) {
                                    subName = categorySubcats[sub];
                                    break;
                                }
                            }
                            return `
                                <span class="category-tag secondary">
                                    ${subName}
                                </span>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeModal';
    closeBtn.className = 'p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-200';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    document.querySelector('.modal-content').appendChild(closeBtn);
    
    if (resource.id) {
        const isFavorite = localStorage.getItem('favorites') ? 
            JSON.parse(localStorage.getItem('favorites')).includes(resource.id) : 
            false;
        
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = `favorite-btn ${isFavorite ? 'active' : ''}`;
        favoriteBtn.dataset.resourceId = resource.id;
        favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
        
        document.querySelector('.modal-content').appendChild(favoriteBtn);
        
        favoriteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const favorites = localStorage.getItem('favorites') ? 
                JSON.parse(localStorage.getItem('favorites')) : 
                [];
            
            const resourceId = favoriteBtn.dataset.resourceId;
            const index = favorites.indexOf(resourceId);
            
            let isNowFavorite;
            if (index === -1) {
                favorites.push(resourceId);
                isNowFavorite = true;
                favoriteBtn.classList.add('active');
            } else {
                favorites.splice(index, 1);
                isNowFavorite = false;
                favoriteBtn.classList.remove('active');
            }
            
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            const icon = favoriteBtn.querySelector('i');
            icon.style.transform = 'scale(1.3)';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 200);
            
            showNotification(isNowFavorite ? 
                'Добавлено в избранное' : 
                'Удалено из избранного');
        });
    }
    
    closeBtn.addEventListener('click', () => {
        closeModal();
    });
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function createFilterMenu() {
    const filters = document.getElementById('filters');
    const style = document.createElement('style');
    document.head.appendChild(style);
    
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'filters-container';
    filters.parentNode.insertBefore(filtersContainer, filters);
    filtersContainer.appendChild(filters);
    
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'filter-toggle md:hidden';
    mobileToggle.innerHTML = `
        <span>Фильтры (показать/скрыть)</span>
        <i class="fas fa-chevron-down"></i>
    `;
    mobileToggle.addEventListener('click', () => {
        const filters = document.getElementById('filters');
        if (filters) {
            const isHidden = filters.classList.contains('hidden');
            
            if (isHidden) {
                filters.classList.remove('hidden');
                filters.style.display = 'flex';
            } else {
                filters.classList.add('hidden');
                filters.style.display = 'none';
            }
            
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (isHidden) {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                } else {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            }
        }
    });
    filtersContainer.insertBefore(mobileToggle, filters);

    if (window.innerWidth < 768) {
        filters.classList.add('hidden');
        filters.style.display = 'none';
    }
    
    filters.innerHTML = `
        <button class="filter-btn px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 active" data-category="all">
            Все
        </button>
    `;	

    const categoryIcons = {
        'Биология': '🧬',
        'Геймдизайн': '🎮',
        'Дизайн': '🎨',
        'ИнженернаяИКомпьютернаяГрафика': '📐',
        'Инноватика': '💡',
        'ИнформационныеТехнологии': '💻',
        'История': '📜',
        'Лингвистика': '🔤',
        'Математика': '🔢',
        'Медицина': '⚕️',
        'НейронныеСети': '🧠',
        'Патентоведение': '📝',
        'Педагогика': '👨‍🏫',
        'Продуктивность': '⏱️',
        'Психология': '🧠',
        'РаботаСТекстом': '📄',
        'Статистика': '📊',
        'Трудоустройство': '👔',
        'УправлениеКачеством': '✅',
        'Физика': '⚛️',
        'Философия': '🤔',
        'Химия': '⚗️',
        'Экономика': '💰',
        'Юриспруденция': '⚖️'
    };

    Object.entries(categories).forEach(([categoryKey, categoryData]) => {
        const subcategoriesCount = Object.keys(categoryData.subcategories).length;
        const hasMultipleSubcategories = subcategoriesCount > 1;
        const icon = categoryIcons[categoryKey] || '';
        
        if (hasMultipleSubcategories) {
            const dropdown = document.createElement('div');
            dropdown.className = 'filter-dropdown relative inline-block';
            
            const mainButton = document.createElement('button');
            mainButton.className = 'filter-btn has-icon px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200';
            mainButton.setAttribute('data-category', categoryKey);
            mainButton.innerHTML = `${icon ? `<span class="mr-1">${icon}</span>` : ''}${categoryData.name} <i class="fas fa-chevron-down ml-1"></i>`;
            
            const submenu = document.createElement('div');
            submenu.className = 'submenu absolute z-10 mt-2 py-2 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg';
            
            const calculateSubmenuPosition = () => {
                const buttonRect = mainButton.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                
                if (viewportWidth < 768) return;
                
                const submenuWidth = Math.min(280, Math.max(200, buttonRect.width * 1.2));
                submenu.style.width = `${submenuWidth}px`;
                
                const spaceOnRight = viewportWidth - buttonRect.right;
                const spaceOnLeft = buttonRect.left;
                
                if (spaceOnRight >= submenuWidth || spaceOnRight >= spaceOnLeft) {
                    submenu.style.left = '0';
                    submenu.style.right = 'auto';
                } else {
                    submenu.style.left = 'auto';
                    submenu.style.right = '0';
                }
            };
            
            setTimeout(calculateSubmenuPosition, 0);
            
            window.addEventListener('resize', calculateSubmenuPosition);
            
            Object.entries(categoryData.subcategories).forEach(([subKey, subName]) => {
                const subButton = document.createElement('button');
                subButton.className = 'filter-btn sub-btn w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200';
                subButton.setAttribute('data-category', categoryKey);
                subButton.setAttribute('data-subcategory', subKey);
                subButton.textContent = subName;
                submenu.appendChild(subButton);
            });
            
            dropdown.appendChild(mainButton);
            dropdown.appendChild(submenu);
            filters.appendChild(dropdown);
            
            mainButton.addEventListener('click', (e) => {
                e.stopPropagation();
                
                document.querySelectorAll('.submenu').forEach(menu => {
                    if (menu !== submenu) {
                        menu.classList.remove('visible');
                    }
                });
                
                submenu.classList.toggle('visible');
                mainButton.querySelector('i').classList.toggle('fa-chevron-up');
                mainButton.querySelector('i').classList.toggle('fa-chevron-down');
                
                if (submenu.classList.contains('visible')) {
                    calculateSubmenuPosition();
                }
            });
        } else {
            const button = document.createElement('button');
            button.className = 'filter-btn has-icon px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200';
            button.setAttribute('data-category', categoryKey);
            button.innerHTML = `${icon ? `<span class="mr-1">${icon}</span>` : ''}${categoryData.name}`;
            filters.appendChild(button);
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-dropdown')) {
            document.querySelectorAll('.submenu').forEach(submenu => {
                submenu.classList.remove('visible');
                const button = submenu.parentNode.querySelector('.filter-btn');
                if (button) {
                    const icon = button.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                }
            });
        }
    });
}

function updateThemeIcons() {
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    const isDark = document.documentElement.classList.contains('dark');
    
    if (sunIcon && moonIcon) {
        sunIcon.classList.toggle('hidden', !isDark);
        moonIcon.classList.toggle('hidden', isDark);
    }
    
    localStorage.theme = isDark ? 'dark' : 'light';
}

function initBurgerMenu() {
    const burgerMenu = document.getElementById('burgerMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuContent = document.querySelector('.menu-content');
    const closeMenu = document.getElementById('closeMenu');
    const themeToggleMenu = document.getElementById('themeToggleMenu');
    const randomMaterialBtn = document.getElementById('randomMaterialBtn');
    const favoritesBtn = document.getElementById('favoritesBtn');
    
    function openMenu() {
        menuOverlay.classList.remove('hidden');
        setTimeout(() => {
            menuContent.classList.add('visible');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenuOnly() {
        menuContent.classList.remove('visible');
    }
    
    function closeMenuFull() {
        menuContent.classList.remove('visible');
        setTimeout(() => {
            menuOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 150);
    }
    
    burgerMenu.addEventListener('click', openMenu);
    closeMenu.addEventListener('click', closeMenuFull);
    
    menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) {
            closeMenuFull();
        }
    });
    
    menuContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    themeToggleMenu.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark', !isDark);
        localStorage.theme = isDark ? 'light' : 'dark';
        updateThemeIcons();
        closeMenuFull();
    });
    
    randomMaterialBtn.addEventListener('click', () => {
        if (resources.length > 0) {
            closeMenuOnly();
            
            const randomIndex = Math.floor(Math.random() * resources.length);
            const randomResource = resources[randomIndex];
            
            setTimeout(() => {
                showModal(randomResource);
                menuOverlay.classList.add('hidden');
                document.body.style.overflow = 'hidden';
            }, 200);
        }
    });
    
    initFavorites();
    
    favoritesBtn.addEventListener('click', () => {
        closeMenuOnly();
        
        setTimeout(() => {
            showFavoritesModal();
            menuOverlay.classList.add('hidden');
        }, 200);
    });
}

function initFavorites() {
    function updateFavoriteButtons() {
        document.querySelectorAll('.favorite-btn, .card-favorite-btn').forEach(btn => {
            const resourceId = btn.dataset.resourceId;
            btn.classList.toggle('active', isFavorite(resourceId));
        });
    }
    
    const originalShowModal = window.showModal;
    window.showModal = function(resource) {
        originalShowModal(resource);
        
        if (!resource.id) return;
        
        const existingBtn = document.querySelector('.favorite-btn');
        if (existingBtn) existingBtn.remove();
        
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        favoriteBtn.dataset.resourceId = resource.id;
        favoriteBtn.dataset.tooltip = isFavorite(resource.id) ? 'Удалить из избранного' : 'Добавить в избранное';
        favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
        
        if (isFavorite(resource.id)) {
            favoriteBtn.classList.add('active');
        }
        
        favoriteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isNowFavorite = toggleFavorite(resource.id);
            favoriteBtn.dataset.tooltip = isNowFavorite ? 'Удалить из избранного' : 'Добавить в избранное';
            favoriteBtn.classList.toggle('active', isNowFavorite);
            
            const icon = favoriteBtn.querySelector('i');
            icon.style.transform = 'scale(1.3)';
            setTimeout(() => { icon.style.transform = 'scale(1)'; }, 200);
            
            showNotification(isNowFavorite ? 'Добавлено в избранное' : 'Удалено из избранного');
        });
        
        document.querySelector('.modal-content').appendChild(favoriteBtn);
    };
    
    function addResourceIds() {
        resources.forEach((resource, index) => {
            if (!resource.id) {
                resource.id = `resource-${index}`;
            }
        });
        
        document.querySelectorAll('.resource-card').forEach((card, index) => {
            if (index < resources.length) {
                card.dataset.resourceId = resources[index].id;
            }
        });
    }
    
    addResourceIds();
    setTimeout(addFavoriteButtonsToCards, 100);
}

function showFavoritesModal() {
    function getFavorites() {
        const favorites = localStorage.getItem('favorites');
        return favorites ? JSON.parse(favorites) : [];
    }
    
    const favoriteIds = getFavorites();
    const favoriteResources = resources.filter(resource => 
        favoriteIds.includes(resource.id)
    );
    
    let modal = document.getElementById('favoritesModal');
    
    if (modal) {
        updateFavoritesModal(modal, favoriteResources);
    } else {
        modal = document.createElement('div');
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50';
        modal.id = 'favoritesModal';
        document.body.appendChild(modal);
        
        updateFavoritesModal(modal, favoriteResources);
        
        setTimeout(() => {
            const content = modal.querySelector('.favorites-modal-content');
            if (content) content.classList.add('visible');
        }, 10);
    }
    
    function updateFavoritesModal(modal, favoriteResources) {
        let modalContent = '';
        
        if (favoriteResources.length === 0) {
            modalContent = `
                <div class="favorites-modal-content bg-white dark:bg-gray-800 max-w-2xl mx-4 my-8 rounded-lg shadow-xl relative p-6">
                    <button id="closeFavoritesModal" class="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-200 shadow-md">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Избранное</h2>
                    
                    <div class="empty-favorites">
                        <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                        </svg>
                        <p class="text-gray-600 dark:text-gray-400">У вас пока нет избранных материалов</p>
                    </div>
                </div>
            `;
        } else {
            modalContent = `
                <div class="favorites-modal-content bg-white dark:bg-gray-800 max-w-4xl mx-4 my-8 rounded-lg shadow-xl relative">
                    <button id="closeFavoritesModal" class="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-200 shadow-md">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Избранное</h2>
                    </div>
                    
                    <div class="p-6 max-h-[60vh] overflow-y-auto">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${favoriteResources.map(resource => {
                                return `
                                    <div class="resource-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-full border border-gray-200 dark:border-gray-700 relative">
                                        <button class="remove-favorite absolute top-2 right-2 p-1 rounded-full bg-white dark:bg-gray-700 text-yellow-500 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200" data-resource-id="${resource.id}">
                                            <i class="fas fa-star"></i>
                                        </button>
                                        <div class="flex gap-2 items-start mb-3">
                                            <div class="resource-type-icon">
                                                ${getResourceTypeIcon(resource.type)}
                                            </div>
                                            <div>
                                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 pr-8">${resource.title}</h3>
                                                <div class="text-sm text-gray-600 dark:text-gray-400">${resource.type} • ${resource.author}</div>
                                            </div>
                                        </div>
                                        <div class="mt-auto pt-4">
                                            <button class="view-resource w-full py-2 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors duration-200 font-medium" data-resource-id="${resource.id}">
                                                Открыть
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        modal.innerHTML = modalContent;
        
        function closeFavoritesModal() {
            const content = modal.querySelector('.favorites-modal-content');
            if (content) content.classList.remove('visible');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 150);
        }
        
        const closeBtn = modal.querySelector('#closeFavoritesModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeFavoritesModal);
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeFavoritesModal();
            }
        });
        
        modal.querySelectorAll('.view-resource').forEach(button => {
            button.addEventListener('click', () => {
                const resourceId = button.dataset.resourceId;
                const resource = resources.find(r => r.id === resourceId);
                if (resource) {
                    closeFavoritesModal();
                    showModal(resource);
                }
            });
        });
        
        modal.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const resourceId = button.dataset.resourceId;
                
                const favorites = localStorage.getItem('favorites');
                const favoritesList = favorites ? JSON.parse(favorites) : [];
                
                const index = favoritesList.indexOf(resourceId);
                if (index !== -1) {
                    favoritesList.splice(index, 1);
                    localStorage.setItem('favorites', JSON.stringify(favoritesList));
                    
                    showNotification('Удалено из избранного');
                    
                    document.querySelectorAll('.favorite-btn, .card-favorite-btn').forEach(btn => {
                        if (btn.dataset.resourceId === resourceId) {
                            btn.classList.remove('active');
                        }
                    });
                    
                    document.querySelectorAll('.resource-card').forEach(card => {
                        if (card.dataset.resourceId === resourceId) {
                            const indicator = card.querySelector('.favorite-indicator');
                            if (indicator) {
                                indicator.remove();
                            }
                        }
                    });
                    
                    const newFavoritesList = favoritesList;
                    const newFavoriteResources = resources.filter(resource => 
                        newFavoritesList.includes(resource.id)
                    );
                    
                    setTimeout(() => {
                        updateFavoritesModal(modal, newFavoriteResources);
                    }, 10);
                }
            });
        });
    }
}

function showNotification(message) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg z-50 opacity-0 transition-opacity duration-300';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

initBurgerMenu();