let userData = [];

async function fetchDataFromAPI() {
    try {
        const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
        const data = await response.json();
        userData = data;
        renderTableAndPagination(); 
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}
//  render table and pagination after search
function renderTableAndPaginationForSearch(searchTerm) {
    // Filter data based on the search term
    const filteredData = userData.filter(user => {
        const lowerCaseName = user.name.toLowerCase();
        const lowerCaseEmail = user.email.toLowerCase();
        const lowerCaseRole = user.role.toLowerCase();

        return lowerCaseName.includes(searchTerm) || lowerCaseEmail.includes(searchTerm) || lowerCaseRole.includes(searchTerm);
    });

    // Update pagination buttons based on the filtered data
    const totalPages = Math.ceil(filteredData.length / 10); // Assuming 10 rows per page
    renderPaginationButtons(totalPages);

    // Render the paginated data
    const currentPage = document.querySelector('.page-number.active');
    const page = parseInt(currentPage ? currentPage.textContent : 1);
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    const displayedUsers = filteredData.slice(startIndex, endIndex);

    // Render the paginated table rows
    renderTableRows(displayedUsers);
}


//  search button click
function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchTerm = searchInput.value.toLowerCase();

    // Render table and pagination specifically for search
    renderTableAndPaginationForSearch(searchTerm);
}



function renderTableRows(data) {
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = '';

    data.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox"></td>
            <td contenteditable="true">${user.name}</td>
            <td contenteditable="true">${user.email}</td>
            <td contenteditable="true">${user.role}</td>
            <td>
                <button class="edit" onclick="handleEditRow(${user.id})"><i class="fa-solid fa-user-pen"></i></button>
                <button class="delete" onclick="handleDeleteRow(${user.id})"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        `;
        tableBody.appendChild(row);

        // Attach event listeners for Edit and Delete buttons
        row.querySelector('.edit').addEventListener('click', () => handleEditRow(row));
        row.querySelector('.delete').addEventListener('click', () => handleDeleteRow(row));
    });
}



function renderPaginationButtons(totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    // Previous button
    const previousButton = document.createElement('button');
    previousButton.textContent = 'Previous';
    previousButton.classList.add('page-number', 'previous');
    paginationContainer.appendChild(previousButton);

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('page-number');
        paginationContainer.appendChild(button);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.classList.add('page-number', 'next');
    paginationContainer.appendChild(nextButton);

    // event listeners for pagination buttons
    const allButtons = document.querySelectorAll('.page-number');
    allButtons.forEach(button => {
        button.addEventListener('click', handlePaginationClick);
    });
}


// pagination button click
function handlePaginationClick(event) {
    const clickedButton = event.target;

    if (clickedButton instanceof HTMLElement) {
        if (clickedButton.classList.contains('previous')) {
            handlePreviousPage();
        } else if (clickedButton.classList.contains('next')) {
            handleNextPage();
        } else {
            // Handle regular page number click
            const page = parseInt(clickedButton.textContent);
            const itemsPerPage = 10;
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const displayedUsers = userData.slice(startIndex, endIndex);

            renderTableRows(displayedUsers);
        }
    }
}


//  pagination button click
function handlePaginationClick(event) {
    const clickedButton = event.target;

    if (clickedButton.classList.contains('previous')) {
        handlePreviousPage();
    } else if (clickedButton.classList.contains('next')) {
        handleNextPage();
    } else {
        // Handle regular page number click
        currentPage = parseInt(clickedButton.textContent);
        renderTableAndPagination();
    }
}

//  table and pagination
function renderTableAndPagination() {
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedUsers = userData.slice(startIndex, endIndex);

    renderTableRows(displayedUsers);
    renderPaginationButtons(Math.ceil(userData.length / itemsPerPage));
}

//  handle previous page
let currentPage = 1; 
function handlePreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTableAndPagination(); 
    }
}

//  handle next page
function handleNextPage() {
    const totalPages = Math.ceil(userData.length / 10); 

    if (currentPage < totalPages) {
        currentPage++;
        renderTableAndPagination(); 
    }
}


let clickedButton;

//  handle delete selected button click
function handleDeleteSelected() {
    const selectedRows = document.querySelectorAll('.row-checkbox:checked');
    selectedRows.forEach(row => {
        const userId = row.closest('tr').querySelector('td:nth-child(2)').textContent; //  the user ID is in the second column
        userData = userData.filter(user => user.id !== parseInt(userId));

        // Removed the row from the table
        row.closest('tr').remove();
    });

    //  pagination and UI after deleting selected rows
    const currentPageElement = document.querySelector('.page-number.active');
    const currentPage = currentPageElement ? currentPageElement.textContent : 1;

    //  if clickedButton is defined before calling handlePaginationClick
    if (clickedButton) {
        handlePaginationClick({ target: { textContent: currentPage } });
    }

    //  the count of selected rows
    updateSelectedCount();
}



//  handle select all button click
function handleSelectAll() {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    const selectAllButton = document.querySelector('.select-all');

    //  if all rows are currently selected
    const allRowsSelected = checkboxes.length === document.querySelectorAll('.row-checkbox:checked').length;

    checkboxes.forEach(checkbox => {
        checkbox.checked = !allRowsSelected;
        handleRowSelection(checkbox);
    });

    if (allRowsSelected) {
        const selectedRows = document.querySelectorAll('.selected');
        selectedRows.forEach(row => {
            row.classList.remove('selected');
        });
    }
    updateSelectedCount();
}

// update the selected count 
function updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.row-checkbox:checked').length;
    const selectedCountElement = document.querySelector('.selected-count');
    selectedCountElement.textContent = `${selectedCount} row${selectedCount !== 1 ? 's' : ''} selected`;
}

//handle individual row selection
function handleRowSelection(checkbox) {
    const row = checkbox.closest('tr');
    row.classList.toggle('selected', checkbox.checked);
    console.log('Checkbox checked:', checkbox.checked);
    updateSelectedCount();
    console.log('Selected count updated.');
}


//  handle Edit button click for a specific row
function handleEditRow(row) {
    row.classList.toggle('editing');
}
//  handle Delete button click for a specific row
function handleDeleteRow(row) {
    const userId = row.querySelector('td:nth-child(2)').textContent; // Assuming the user ID is in the second column
    userData = userData.filter(user => user.id !== parseInt(userId));

    // Remove the row from the table
    row.remove();
    updateSelectedCount();
}

document.addEventListener('DOMContentLoaded', () => {
    // Fetch data from the API
    fetchDataFromAPI();

    //  event listener for pagination buttons
    const paginationButtons = document.querySelectorAll('.page-number');
    paginationButtons.forEach(button => {
        button.addEventListener('click', handlePaginationClick);
    });

    //  event listener for delete selected button
    const deleteSelectedButton = document.querySelector('.delete-selected');
    deleteSelectedButton.addEventListener('click', handleDeleteSelected);

    //  event listener for select all button
    const selectAllButton = document.querySelector('.select-all');
    selectAllButton.addEventListener('click', handleSelectAll);

    //  event listener for row checkboxes
    const tableBody = document.querySelector('table tbody');
    tableBody.addEventListener('change', (event) => {
        if (event.target.classList.contains('row-checkbox')) {
            handleRowSelection(event.target);
        }
    });
    // event listener for document click to exit editing mode
    document.addEventListener('click', (event) => {
        if (!event.target.classList.contains('edit') && !event.target.closest('.editing')) {
            document.querySelectorAll('.editing').forEach(row => {
                row.classList.remove('editing');
            });
        }
    });

    //  event listener for search button
    const searchButton = document.querySelector('.search-icon');
    searchButton.addEventListener('click', handleSearch);

    renderPaginationButtons(Math.ceil(userData.length / 10));
});