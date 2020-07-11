(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []

  const dataPanel = document.querySelector('#data-panel')
  const searchForm = document.querySelector('#search')
  const searchInput = document.querySelector('#search-input')

  const pagination = document.querySelector('.pagination')
  const ITEM_PER_PAGE = 12


  axios.get(INDEX_URL)
    .then(function (res) {
      data.push(...res.data.results)
      // displayDataList(data)
      getTotalPages(data)
      getPageData(1, data)
    }).catch(function (err) { console.log(err) })

  // listen to search form submit event
  searchForm.addEventListener('submit', function (event) {
    console.log("click!")
    // <form>和<button>放在一起時，<button>的預設行為是將表單內容透過HTTP request提交給遠端伺服器，因此click一閃而退(重新刷新頁面)，除非使用Ajax技術發送非請求，否則一般的HTTP request都會刷新瀏覽器畫面。遇到此種有預設行為的元件，需要使用event.preventDefault()來終止預設行為。
    event.preventDefault()
    let input = searchInput.value
    // let results = data.filter(
    //   movie => movie.title === input
    // )  只會搜尋到"完全符合"的情況
    let results = data.filter(
      movie => movie.title.toLowerCase().includes(input)
    )
    console.log(results)
    // displayDataList(results)
    getTotalPages(results)
    getPageData(1, results)

  })


  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      console.log(event.target.dataset.id)
      addFavoriteItem(event.target.dataset.id)
    }
  })

  //listen to pagination click event
  pagination.addEventListener('click', function (event) {
    console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
    }
  })

  function displayDataList(data) {
    let htmlContent = ''
    data.forEach(function (item) {
      htmlContent += `
    <ul>
      <li class='d-flex pt-3' style='list-style-type:none; border-top:1px solid #DCDCDC;line-height:20px;'>
        <div>
          <p style='font-size:20px;'>${item.title}</p>
        </div>
        <div class='ml-auto'>
          <button class='btn btn-primart btn-show-movie' data-toggle='modal' data-target='#show-movie-modal' data-id='${item.id}'>More</button>
          <button class='btn btn-info btn-add-favorite' data-id='${item.id}'>+</button>
        </div>
      </li>
    </ul>

    `
    })
    dataPanel.innerHTML = htmlContent
  }

  function showMovie(id) {
    const modalTitle = document.querySelector('#show-movie-title')
    const modalImage = document.querySelector('#show-movie-image')
    const modalDate = document.querySelector('#show-movie-date')
    const modalDescription = document.querySelector('#show-movie-description')
    console.log(modalImage)

    // set request url
    const url = INDEX_URL + id

    axios.get(url)
      .then(function (res) {
        const data = res.data.results

        // insert data into modal ui
        modalTitle.textContent = data.title
        modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
        modalDate.textContent = `release at : ${data.release_date}`
        modalDescription.textContent = `${data.description}`
      })
  }



  // 存取favoriteMovies
  function addFavoriteItem(id) {
    //如果在localStorage找不到favoriteMovies，則產生空的list []
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

    //JSON回傳型別string，運用Number將id轉為數字才能正確判斷
    const movie = data.find(item => item.id === Number(id))
    //some 則可以依條件檢查 Array 後回傳 boolean
    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      //將movie加數list清單
      list.push(movie)
      alert(`Add ${movie.title} to your favortie list!`)
    }
    //儲存更新後的list清單在localStorage
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }


  // 設置分頁
  function getTotalPages(data) {
    //用ceil將資料數除以一頁要顯示的資料術後向上取整，如果完全沒有資料則顯示1
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      //一般來說<a> tag表示超連結，也就是說點擊之後會跳轉到某個頁面，而跳轉到哪個頁面則是用href屬性去控制。 不過仔細看一下我們為分頁做的pagination ，我們每次點擊其中的<a> tag並不是要真的跳轉到某個頁面去，我們只是希望透過點擊決定要顯示哪一頁的資料，頁面至始至終都是同一頁。
      //但<a> tag又不得沒有href，所以我們會透過強制點擊後去執行一段空的程式碼去避免預設的跳轉行為
      // javascript: 表示執行冒號後面的js程式碼
      // javascript: ; 表示執行一段空的js程式碼，因為冒號後什麼都沒有
      pageItemContent += `
    <li class='page-item'>
      <a class='page-link' href='javascript:;' data-page='${i + 1}'>${i + 1}</a>
    </li>
    `
    }
    pagination.innerHTML = pageItemContent
  }

  // 在 getPageData 的外面設置一個變數 paginationData，讓 getPageData 擁有固定的資料來源(第一次渲染頁面時呼叫getPageData已將包含左有電影的data存入list中，監聽事件觸發後沒有電影資料被傳入，因為會沿用已儲存的內容)
  let paginationData = []

  function getPageData(pageNum, data) {
    // 如果呼叫 getPageData 時有電影資料被傳入，就用新傳入的資料作運算，然後 paginationData 會被刷新
    // 如果呼叫 getPageData 時沒有電影資料被傳入，則沿用 paginationData 裡的內容，確保 slice 始終有東西可以處理
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }

})()


