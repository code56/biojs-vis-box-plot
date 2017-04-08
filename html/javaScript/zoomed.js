/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* 
 * Creates the context menu which is displayed when the user clicks an 
 * element.
 */
//var define_menu = function () {
    var menu = [
        {
            title: 'Item #1',
            action: function (elm, d, i) {
                console.log('Item #1 clicked!');
                console.log('The data for this circle is: ' + d);
            },
            disabled: false // optional, defaults to false
        },
        {
            title: 'Item #2',
            action: function (elm, d, i) {
                console.log('You have clicked the second item!');
                console.log('The data for this circle is: ' + d);
            }
        }
    ]
  //  return menu;
//}
