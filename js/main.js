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

function displayResources(filteredResources) {
    const resourcesList = document.getElementById('resourcesList');
    resourcesList.innerHTML = '';

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
        return;
    }

    filteredResources.forEach((resource, index) => {
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
        card.className = 'resource-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col h-full';
        
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
                        <span class="category-tag primary">
                            ${cat}
                        </span>
                    `).join('')}
                    ${subcategoryNames.map(sub => `
                        <span class="category-tag secondary">
                            ${sub}
                        </span>
                    `).join('')}
                </div>
            </div>
            <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <button class="resource-link w-full py-2 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors duration-200 font-medium">
                    Подробнее
                </button>
            </div>
        `;
        
        const detailsButton = card.querySelector('.resource-link');
        detailsButton.addEventListener('click', () => {
            showModal(resource);
        });
        
        resourcesList.appendChild(card);
    });
}

function showModal(resource) {
    const modal = document.getElementById('resourceModal');
    
    const resourceSlug = resource.title
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?resource=${encodeURIComponent(resourceSlug)}`;

    document.querySelector('.modal-content').innerHTML = `
        <button id="closeModal" class="absolute right-4 top-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-200 z-10">
            <i class="fas fa-times"></i>
        </button>

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
                
                <div class="detail-item">
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Поделиться</div>
                    <button id="shareButton" class="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md transition-colors duration-200">
                        <i class="fas fa-share-alt"></i>
                        Скопировать ссылку
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('shareButton').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: resource.title,
                text: `${resource.title} - ${resource.author}`,
                url: shareUrl
            }).catch(() => {
                copyToClipboard(shareUrl);
            });
        } else {
            copyToClipboard(shareUrl);
        }
    });
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function createFilterMenu() {
    const filters = document.getElementById('filters');
    const style = document.createElement('style');
    style.textContent = `
        .filter-btn.active {
            background-color: rgb(219 234 254) !important;
            color: rgb(30 64 175) !important;
        }
        
        .dark .filter-btn.active {
            background-color: rgb(30 58 138) !important;
            color: rgb(191 219 254) !important;
        }

        .sub-btn.active {
            background-color: rgb(219 234 254) !important;
            color: rgb(30 64 175) !important;
        }
        
        .dark .sub-btn.active {
            background-color: rgb(30 58 138) !important;
            color: rgb(191 219 254) !important;
        }
    `;
    document.head.appendChild(style);
    
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'filters-container';
    filters.parentNode.insertBefore(filtersContainer, filters);
    filtersContainer.appendChild(filters);
    
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'filter-toggle md:hidden';
    mobileToggle.innerHTML = `
        <span>Фильтры</span>
        <i class="fas fa-chevron-down"></i>
    `;
    mobileToggle.addEventListener('click', () => {
        const isHidden = filters.classList.contains('hidden');
        filters.classList.toggle('hidden', !isHidden);
        mobileToggle.querySelector('i').classList.toggle('fa-chevron-up', isHidden);
        mobileToggle.querySelector('i').classList.toggle('fa-chevron-down', !isHidden);
    });
    filtersContainer.insertBefore(mobileToggle, filters);
    
    if (window.innerWidth < 768) {
        filters.classList.add('hidden');
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
            submenu.className = 'submenu absolute z-10 mt-2 py-2 w-48 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700';
            submenu.style.left = '50%';
            submenu.style.transform = 'translateX(-50%)';
            
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

document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
	
	document.getElementById('themeToggle').addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark', !isDark);
        localStorage.theme = isDark ? 'light' : 'dark';
        updateThemeIcons();
    });
    
    updateThemeIcons();
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

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showCopyNotification('Ссылка скопирована в буфер обмена!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                fallbackCopyToClipboard(text);
            });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '0';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyNotification('Ссылка скопирована в буфер обмена!');
        } else {
            showCopyNotification('Не удалось скопировать ссылку', true);
        }
    } catch (err) {
        showCopyNotification('Ошибка при копировании: ' + err, true);
    }
    
    document.body.removeChild(textarea);
}

function showCopyNotification(message, isError = false) {
    const existingNotification = document.getElementById('copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'copy-notification';
    notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-opacity duration-300 z-50 ${
        isError 
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }`;
    notification.style.opacity = '1';
    notification.style.zIndex = '9999';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}