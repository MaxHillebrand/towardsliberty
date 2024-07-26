async function loadData() {
    try {
        const response = await fetch('datas/datas.json');
        const data = await response.json();

        const categories = [...new Set(data.map(item => item.category))];
        const types = [...new Set(data.map(item => item.type))];

        fetch('datas/nostr.json')
            .then(response => response.json())
            .then(data => {
                window.jsonData = data;
                displayNostrData(data, currentPage);
            })
            .catch(error => console.error('Error fetching data:', error));
        
        displayData(data);
        displayFilters(categories, types);
        addFilterEventListeners(data);
        addSearchEventListener(data);
    } catch (error) {
        console.error('Error loading JSON data:', error);
    }
}

/*async function createFilters() {
    try {
        const categories = await fetch('/datas/categories.json');
        const categoriesData = await categories.json(); 
        const types = await fetch('/datas/types.json');
        const typesData = await types.json(); 
        console.log(categoriesData)
        console.log(typesData)
        displayFilters(categoriesData, typesData);
    } catch (error) {
        console.error('Error loading JSON data:', error);
    }
}*/

function displayFilters(categoriesData, typesData) {
    const containerMultiple = document.getElementById('categoryMultipleSelector');

    categoriesData.forEach((item, index) => {
        const opt = document.createElement('option');
        opt.textContent = item;
        opt.value = item;        
        containerMultiple.appendChild(opt);
    });
    const typesMultiple = document.getElementById('typeMultipleSelector');
    typesData.forEach((item, index) => {
        const opt = document.createElement('option');
        opt.textContent = item;
        opt.value = item;
        typesMultiple.appendChild(opt);
    });
    $(document).ready(function() {
        $('#typeMultipleSelector').select2({
            placeholder: 'Type'            
        });
    });
    $(document).ready(function() {
        $('#categoryMultipleSelector').select2({
            placeholder: 'Category'
        });
    });
}

function addSearchEventListener(data) {    
    const searchInput = document.getElementById('exampleDataList');
    const filterName = document.getElementById('filtername');
    const typeSelect = document.getElementById('typeMultipleSelector');
    const categorySelect = document.getElementById('categoryMultipleSelector');
    searchInput.addEventListener('input', event => {
        $('#categoryMultipleSelector').val(null).trigger('change');
        $('#typeMultipleSelector').val(null).trigger('change');
        const searchTerm = event.target.value.toLowerCase();
        if (searchTerm.length > 2) {
            const filteredData = data.filter(item => 
                (item.title && item.title.toLowerCase().includes(searchTerm)) ||
                (item.description && item.description.toLowerCase().includes(searchTerm))
            );
            filterName.innerHTML = '';
            filterName.textContent = 'Text: ' + event.target.value;
            displayData(filteredData);
        }
        if (searchTerm.length == 0) {    
            filterName.innerHTML = '';        
            displayData(data);
        }
        
    });}

    function addFilterEventListeners(data) {
        const filterName = document.getElementById('filtername');
        const searchInput = document.getElementById('exampleDataList');    
        const deleteFilter = document.getElementById('delete-filters');
    
        function applyFilters() {
            const selectedTypes = $('#typeMultipleSelector').val() || [];
            const selectedCategories = $('#categoryMultipleSelector').val() || [];
            
            let filteredData = data;
    
            if (selectedTypes.length > 0) {
                filteredData = filteredData.filter(item => selectedTypes.includes(item.type));
            }
    
            if (selectedCategories.length > 0) {
                filteredData = filteredData.filter(item => selectedCategories.includes(item.category));
            }
    
            let filterText = 'Filters: ';
            if (selectedTypes.length > 0) {
                filterText += 'Type: ' + selectedTypes.join(', ');
            }
            if (selectedCategories.length > 0) {
                if (selectedTypes.length > 0) {
                    filterText += ' | ';
                }
                filterText += 'Category: ' + selectedCategories.join(', ');
            }
            filterName.textContent = filterText;
    
            displayData(filteredData);
        }
    
        function onTypeChange(event) {
            applyFilters();
        }
    
        function onCategoryChange(event) {
            applyFilters();
        }
    
        $('#typeMultipleSelector').on('change', onTypeChange);
        $('#categoryMultipleSelector').on('change', onCategoryChange);
    
        deleteFilter.addEventListener('click', event => {
            event.preventDefault(); 
            filterName.innerHTML = '';  
            searchInput.value = '';
            $('#typeMultipleSelector').val(null).trigger('change');
            $('#categoryMultipleSelector').val(null).trigger('change');
            displayData(data);
        });
    }
    

let currentPage = 1;
const itemsPerPage = 12;

function displayNostrData(data, page = 1) {
    const container = document.getElementById('nostr-data-container');
    container.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    paginatedData.forEach(item => {
        const colDiv = document.createElement('div');
        colDiv.classList.add('col-sm-6', 'col-md-4', 'col-lg-3');

        const boxDiv = document.createElement('div');
        boxDiv.classList.add('box');

        const meta = document.createElement('div');
        meta.classList.add('box-meta');

        if (item.date) {            
            const dateSpan = document.createElement('span');
            dateSpan.classList.add('date', 'nostr-date');
            dateSpan.textContent = item.date;
            meta.appendChild(dateSpan);
        }
        const boxTitleDiv = document.createElement('div');
        boxTitleDiv.classList.add('box-title');
        if (item.title) {
            boxTitleDiv.textContent = item.title || 'No Title';
        }       

        const boxDescriptionDiv = document.createElement('div');
        boxDescriptionDiv.classList.add('box-description');
        boxDescriptionDiv.textContent = item.content || 'No Description';
        
        if (item.date) {            
            boxDiv.appendChild(meta);
        }

        const link = document.createElement('a');
        //link.href = 'https://nostrexplorer.com/e/' + item.id;
        link.href = 'https://njump.me/' + item.id;
        link.target = '_blank';
        link.classList.add('stretched-link');

        const span = document.createElement('span');
        span.classList.add('tag');
        let kind = '';
        if (item.kind == 1 ) {
            kind = 'Short Text Note'
        } else {
            kind = 'Repost'
        }
        span.textContent = kind;

        boxDiv.appendChild(boxTitleDiv);
        boxDiv.appendChild(boxDescriptionDiv);
        boxDiv.appendChild(link);
        boxDiv.appendChild(span);        
        colDiv.appendChild(boxDiv);
        container.appendChild(colDiv);
    });

    createPagination(data.length);
}

function createPagination(totalItems) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.classList.add('pagination-button', 'btn');
        button.textContent = i;
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentPage = i;
            displayNostrData(jsonData, currentPage);
        });
        paginationContainer.appendChild(button);
    }
}

function displayData(data) {
    const container = document.getElementById('data-container');
    container.innerHTML = '';

    data.forEach(item => {
        const colDiv = document.createElement('div');
        colDiv.classList.add('col-sm-6', 'col-md-4', 'col-lg-3');

        const boxDiv = document.createElement('div');
        boxDiv.classList.add('box');

        const boxImageDiv = document.createElement('div');
        boxImageDiv.classList.add('box-image');
        const meta = document.createElement('div');
            meta.classList.add('box-meta');
        
        if(item.date && item.author) {
            
            const dateSpan = document.createElement('span');
            dateSpan.classList.add('date');
            dateSpan.textContent = item.date;
            const authorSpan = document.createElement('span');
            authorSpan.classList.add('author');
            authorSpan.textContent = ' - ' + item.author;
            meta.appendChild(dateSpan);
            meta.appendChild(authorSpan);
        }
        const span1 = document.createElement('span');
        span1.classList.add('tag')
        span1.textContent = item.category
        const span2 = document.createElement('span');
        span2.classList.add('tag')
        span2.textContent = item.type
        const img = document.createElement('img');
        img.src = item.ogimage || 'https://placehold.co/150x150?text=No+Image+Found';
        img.alt = item.title || 'Image';
        img.classList.add('w-100');

        const boxTitleDiv = document.createElement('div');
        boxTitleDiv.classList.add('box-title');
        boxTitleDiv.textContent = item.title || 'No Title';

        const boxDescriptionDiv = document.createElement('div');
        boxDescriptionDiv.classList.add('box-description');
        boxDescriptionDiv.textContent = item.description || 'No Description';

        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.classList.add('stretched-link');

        boxImageDiv.appendChild(img);
        boxDiv.appendChild(boxImageDiv);
        if(item.date && item.author) {            
            boxDiv.appendChild(meta);
        }
        boxDiv.appendChild(boxTitleDiv);
        boxDiv.appendChild(boxDescriptionDiv);
        boxDiv.appendChild(link);        
        boxDiv.appendChild(span1);
        boxDiv.appendChild(span2);
        colDiv.appendChild(boxDiv);
        container.appendChild(colDiv);
    });
}

document.addEventListener('DOMContentLoaded', loadData);