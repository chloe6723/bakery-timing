Component({
  data: { selected: 0, tabs: [
    { pagePath: '/pages/ledger/ledger', icon: '▥', text: '店长台账' },
    { pagePath: '/pages/orders/orders', icon: '▤', text: '订单管理' },
    { pagePath: '/pages/market/market', icon: '◇', text: '集市' }
  ] },
  methods: { switchTab(event) { const index = Number(event.currentTarget.dataset.index); wx.switchTab({ url: this.data.tabs[index].pagePath }) } }
})
