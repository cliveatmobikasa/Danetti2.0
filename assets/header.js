
// for trustbanner smooth transisions

const bannerItems = document.querySelectorAll('.hd-Banner_Item, .hd-Dropdown')
const trustpilot = document.querySelector('.hd-Trustpilot')
const trustpilotHidden = document.querySelector('.hd-Trustpilot.hd-Dnone')
const hdropdown = document.querySelectorAll('.hd-Dropdown')

if (!trustpilotHidden) {
  hdropdown.forEach(element => {
    element.classList.add('hd-Trust')
  })
}

bannerItems.forEach(bannerItem => {
  const dropdown = bannerItem.querySelector('.hd-Dropdown')

  if (dropdown) {
    bannerItem.addEventListener('mouseenter', () => {
      trustpilot.classList.add('hd-Trustpilot-hidden')
    })

    bannerItem.addEventListener('mouseleave', () => {
      trustpilot.classList.remove('hd-Trustpilot-hidden')
    })
  }
})

// navigation

const navListItems = document.querySelectorAll('.hd-NavList_Items')

// Iterate through each .hd-NavList_Items
navListItems.forEach(navListItem => {
  const listItemCount = navListItem.querySelectorAll('li').length

  if (listItemCount > 10) {
    const parentColumn = navListItem.closest('.hd-NavList_Column-navigation')
    if (parentColumn) {
      parentColumn.classList.add('hd-NavList_Wrap')
    }
  }
})

window.onload = function () {
  const navLinks = document.querySelectorAll('.hd-NavList_LinkText');

  navLinks.forEach(linkText => {
      const lineHeight = parseInt(window.getComputedStyle(linkText).lineHeight, 10) || 1;
      const height = linkText.clientHeight;
      const lines = height / lineHeight;
  
      if (lines > 1) {
          linkText.classList.add('hd-Multiline-text');
      }
  });
  
}
