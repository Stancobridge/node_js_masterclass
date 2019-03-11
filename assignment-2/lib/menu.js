/**
 * Contains the Module for Handling Menu
 * 
 */

//  Container for the menu Module
let menu = {};

// Menu items
menu._items = {
    allItems : [
        {
            id : 1,
            item_name : "Mario's Italian",
            item_price : "45",
            size : 'small'
        },
        {
            id : 2,
            item_name : "Crust Gourmet Pizza Bar (Surfers Paradise)",
            item_price : "27",
            size : 'big'
        },
        {
            id : 3,
            item_name : "Marie's Pizza Mermaid Waters",
            item_price : "33",
            size : 'small'
        },
        {
            id : 4,
            item_name : "Three Kings Pizza (Surfers Paradise)",
            item_price : "40",
            size : 'big'
        },
        {
            id : 5,
            item_name : "Sage Cafe Restaurant",
            item_price : "253",
            size : 'small'
        },
        {
            id : 6,
            item_name : "Gemelli Italian",
            item_price : "321",
            size : 'big'
        }
    ]
};

// Get every item in the Menu
// Required - none
// Optional - none
menu.getAll = () => {
    return menu._items.allItems;
}

// Get the item for the given id
// Required - none
// Optional - None
menu.find = (id) => {
    let item = menu._items.allItems.find(item => item.id == id);
    if(item) return item
    return false;
};

// Export Menu Module
module.exports = menu;

