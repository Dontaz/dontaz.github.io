function createFilterMenu() {
    const filters = document.getElementById('filters');
    filters.innerHTML = `
        <button class="filter-btn active px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200" data-category="all">
            Все
        </button>
    `;

    Object.entries(categories).forEach(([categoryKey, categoryData]) => {
        // Проверяем количество подкатегорий
        const subcategoriesCount = Object.keys(categoryData.subcategories).length;
        const hasMultipleSubcategories = subcategoriesCount > 1;
        
        if (hasMultipleSubcategories) {
            // Создаем выпадающее меню для категорий с несколькими подкатегориями
            const dropdown = document.createElement('div');
            dropdown.className = 'filter-dropdown relative inline-block';
            
            const mainButton = document.createElement('button');
            mainButton.className = 'filter-btn px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200';
            mainButton.setAttribute('data-category', categoryKey);
            mainButton.textContent = categoryData.name;
            
            const submenu = document.createElement('div');
            submenu.className = 'submenu absolute z-10 mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden';
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
                const isVisible = !submenu.classList.contains('hidden');
                
                // Закрываем все другие подменю
                document.querySelectorAll('.submenu').forEach(menu => {
                    menu.classList.add('hidden');
                });
                
                // Открываем текущее подменю, если оно было закрыто
                if (!isVisible) {
                    submenu.classList.remove('hidden');
                }
            });
        } else {
            // Создаем простую кнопку для категорий с одной подкатегорией
            const button = document.createElement('button');
            button.className = 'filter-btn px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200';
            button.setAttribute('data-category', categoryKey);
            button.textContent = categoryData.name;
            filters.appendChild(button);
        }
    });

    // Закрываем подменю при клике вне его
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-dropdown')) {
            document.querySelectorAll('.submenu').forEach(submenu => {
                submenu.classList.add('hidden');
            });
        }
    });
}

function formatDescription(description) {
    // Заменяем [[текст ссылки>>url]] на HTML-ссылку
    return description.replace(
        /\[\[([^\]]+)>>([^\]]+)\]\]/g, 
        '<a href="$2" target="_blank" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">$1</a>'
    );
}

function displayResources(filteredResources) {
    const resourcesList = document.getElementById('resourcesList');
    resourcesList.innerHTML = '';

    filteredResources.forEach((resource, index) => {
        // Получаем имена всех категорий
        const categoryNames = resource.categories.map(cat => 
            categories[cat]?.name || cat
        );
        
        const subcategoryNames = resource.subcategories
            .map(sub => {
                // Ищем подкатегорию во всех категориях ресурса
                for (const cat of resource.categories) {
                    const categorySubcats = categories[cat]?.subcategories;
                    if (categorySubcats && categorySubcats[sub]) {
                        return categorySubcats[sub];
                    }
                }
                return sub;
            });
        
        const card = document.createElement('div');
        card.className = 'resource-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full';
        
        card.innerHTML = `
            <div class="flex-grow">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${resource.title}</h3>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">${resource.type} • ${resource.author}</div>
                <p class="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">${resource.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${categoryNames.map(cat => `
                        <span class="px-2 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            ${cat}
                        </span>
                    `).join('')}
                    ${subcategoryNames.map(sub => `
                        <span class="px-2 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            ${sub}
                        </span>
                    `).join('')}
                </div>
            </div>
            <div class="mt-auto pt-4">
                <button class="resource-link inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    Подробнее →
                </button>
            </div>
        `;
        
        // Добавляем обработчик для кнопки "Подробнее"
        const detailsButton = card.querySelector('.resource-link');
        detailsButton.addEventListener('click', () => {
            showModal(resource);
        });
        
        resourcesList.appendChild(card);
    });
}

function showModal(resource) {
    const modal = document.getElementById('resourceModal');
    
    // Устанавливаем заголовок
    document.getElementById('modalTitle').textContent = resource.title;
    
    // Устанавливаем автора
    document.getElementById('modalAuthor').textContent = resource.author;
    
    // Разбиваем описание на параграфы и форматируем
    const paragraphs = resource.description.split('\n\n').filter(p => p.trim());
    const formattedDescription = paragraphs
        .map(p => `<p class="mb-4">${formatDescription(p)}</p>`)
        .join('');
    document.getElementById('modalDescription').innerHTML = formattedDescription;
    
    // Устанавливаем категории
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
    
    document.getElementById('modalCategories').innerHTML = `
        ${categoryNames.map(cat => `
            <span class="px-2 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                ${cat}
            </span>
        `).join('')}
        ${subcategoryNames.map(sub => `
            <span class="px-2 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                ${sub}
            </span>
        `).join('')}
    `;
    
    // Показываем модальное окно
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Функция закрытия модального окна
function closeModal() {
    const modal = document.getElementById('resourceModal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}


function initializeModalHandlers() {
    // Закрытие по клику на крестик
    document.getElementById('closeModal').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });

    // Закрытие по клику вне модального окна
    const modal = document.getElementById('resourceModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по нажатию Escape
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
        
        button.classList.add('active');
        currentCategory = button.dataset.category;
        currentSubcategory = button.dataset.subcategory || null;
        
        filterResources();
    });

    document.getElementById('closeModal').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });

    displayResources(resources);
}

document.addEventListener('DOMContentLoaded', initializeFiltersAndSearch);