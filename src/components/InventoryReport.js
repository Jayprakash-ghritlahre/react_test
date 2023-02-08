import React, {Component, createRef} from 'react'
import StaticReport from './StaticReport';
import Multiselect from 'multiselect-react-dropdown';
import { ColorRing } from  'react-loader-spinner'
import Cookies from 'js-cookie';
import Moment from 'moment';


import "react-datepicker/dist/react-datepicker.css";

const SUMMARY_DATA_PROPERTIES = {'lab':'diamond#cert','shape': 'diamond#shape','color': 'diamond#color','clarity': 'diamond#clarity','carats': 'gem#carats','milky': 'diamond#milky','shade': 'diamond#shade','make': 'diamond#make','fluor': 'diamond#fluor','bic': 'diamond#black_in_center','bis': 'diamond#black_in_side','wis': 'diamond#white_in_side','wic': 'diamond#white_in_center'}
const ICON_HASH_FOR_SUMMERY = {'Total Price': ['bi-card-checklist', 'sales-card'], 'Average Price': ['bi-currency-dollar', 'revenue-card'], 'Count': ['bi-people' , 'customers-card']}

class InventoryReport extends Component {
  constructor(props) {
    super(props);

    const inv_date = Moment(new Date()).format('yyyy-MM-DD')
    this.initialState = {
      DataisLoaded: false,
      itemsData: {},
      options: {},
      reportSummary: {'Total Price': 0, 'Average Price': 0, 'Count': 0},
      DataisLoaded: false,
      BreakdownDataLoaded: false,
      showAlert: false,
      filterHash: {
        'size'                    : 1,
        'end_date'                : '',
        'start_date'              : '',
        'inventory_date'          : inv_date,
        'show_mine'               : true,
        'show_others'             : true,
        'seller_account_id'       : [],
        'get_filtered_data'       : true,
        'item_filter'             : {'discrete': {}},
        'get_only_matching_count' : true,
        'change_breakdown'        : true,
        'get_turn'                : false,
        'is_sale_report'          : false
      },
      change_breakdown: true,
      inventory_date: inv_date,
      get_turn: false,
    }
    this.initialItemData = createRef(0)
    this.initialRankData = createRef(0)

    this.state = {...this.initialState };

    this.calculateData = this.calculateData.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.generateOptions = this.generateOptions.bind(this)
    this.serialize = this.serialize.bind(this)
    this.getBreakdownData = this.getBreakdownData.bind(this)
  }

  componentDidMount() {
    this.getBreakdownData();
    this.calculateData();
  }  

  getBreakdownData() {
    let accessToken = Cookies.get('access_token')
    let queryParams = this.state.filterHash
    fetch(process.env.REACT_APP_API_URL + "/inventory_report", {method: 'POST', headers: {'Authorization': 'Bearer '+ accessToken, 'Content-Type': 'application/json'}, body: JSON.stringify(queryParams)})
      .then(response => response.json())
      .then((response) => {
        this.generateOptions(response)
        if(Object.values(response).every(element => element.length == 0))
          this.setState({showAlert: true});
        this.setState({
          itemsData: response,
          DataisLoaded: true,
          BreakdownDataLoaded: true,
          });
      })
    }

  serialize(obj, prefix) {
    var str = [],
    p,m;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        if (!isNaN(p)){
          m=''
        }else{
          m=p
        }
        var k = prefix ? prefix + "["+m+"]" : p,
          v = obj[p];
        str.push((v !== null && typeof v === "object") ?
          this.serialize(v, k) :
          encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  }

  generateOptions(response){
    Object.entries(response).map(([key, options]) => {
      options.map(data=>{
        data['className'] = key
      })
    })
    this.setState({
      options: response
    })
  }

  calculateData(event){
    let accessToken = Cookies.get('access_token')
    this.setState({BreakdownDataLoaded: false})
    let queryParams = this.serialize(this.state.filterHash)
    fetch(process.env.REACT_APP_API_URL + "/items?"+ queryParams, {method: 'GET', headers: {'Authorization': 'Bearer '+ accessToken }})
      .then(response => response.json())
      .then((response) => {
        let reportSummary = this.state.reportSummary
        reportSummary['Count'] = response.meta.total
        reportSummary['Total Price'] = response.meta.aggregations.total_sum.slice(0,-3)
        reportSummary['Average Price'] = response.meta.aggregations.average.slice(0,-3)
        this.setState({
          reportSummary: reportSummary
        });
      })

    // Calculate BreakDown
    let filterHash  = this.state.filterHash
    let getBreakdown = true

    filterHash.get_turn = false
    filterHash.inventory_date = this.state.inventory_date
    filterHash.change_breakdown = true
    this.setState({filterHash: filterHash})
    this.getBreakdownData()
  }


  onSelect(selectedList, removedItem) {
    var filterValues = []
    var attrName = null
    if (selectedList.length == 0 ){
      attrName = SUMMARY_DATA_PROPERTIES[removedItem.className]
    }  
    Object.entries(selectedList).map(([key, option]) => {
      attrName = SUMMARY_DATA_PROPERTIES[option.className]
      if (attrName) {
        if (attrName === "gem#carats"){
          let carat_range = option.key.split('-')
          filterValues.push({'to':carat_range[0], 'from':carat_range[1]})
        }
        else{
          filterValues.push(option.key)
        }
      }
    })
    let filterHash = this.state.filterHash
    filterHash['item_filter']['discrete'][attrName] = filterValues.flat()
    this.setState({
      filterHash: filterHash
    })
  }

  render(){
    console.log(this.state)
    const { DataisLoaded} = this.state;

    let noRecords = Object.values(this.state.itemsData).every(element => element.length == 0)
    let showAlert = noRecords && this.state.showAlert
    let drilldownStyle = { display: 'none'}
    
    if (!DataisLoaded)
      return(
        <div className='row'>
          <div className="align-items-center justify-content-center">
            <h3 className=" text-center"> Fetching reports for you.... </h3>
          </div>
          <ColorRing
            visible={true}
            height="60"
            width="60"
            ariaLabel="blocks-loading"
            wrapperStyle={{}}
            wrapperClass="blocks-wrapper"
            colors={['#00319f', '#2e56b1', '#5c7bc2', '#8aa1d3', '#b2c1e2']}
          />
        </div>)

    return(
      <div className="row justify-content-start border-secondary">
        {showAlert ? 
          <div className="alert alert-warning alert-dismissible fade show text-center" role="alert">
            <i className="bi bi-exclamation-triangle me-1"></i>
              Oops, we couldn’t find any data. Please try with different some filters or params.
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>: null}
        <br></br>
        <div className='filters card multiselect-dropdown'>  
          {noRecords ? null : 
          <div className="row mb-3 ">
            {Object.entries(this.state.options).map(([key, options]) => {
              return (
                <div className="col-sm-3 multiselect-dropdown">
                  <Multiselect
                    style={{backgroundColor:'#4154f1'}}
                    optionLabel={"Select "+key}
                    onSelect={this.onSelect}
                    onRemove={this.onSelect}
                    className={key}
                    options={options}
                    displayValue='name'
                    placeholder={"Select "+key}
                    />
                </div>
              )
            })}
          </div>}
        </div>
        <div className='col-lg-8'>  
          <div className="row">
            <div className='col-xxl-2 col-md-6'>
              <button type="button" className="btn btn-primary" onClick={this.calculateData}><i className=" bi bi-sliders me-1"></i> Apply Filters</button>
            </div>
          </div>
          <hr></hr>
        </div>
        
        {noRecords ? null :
        <div className="col-lg-12 dashboard">
          <div className="row">
            {Object.entries(this.state.reportSummary).map(([key, value]) => {
            return(
              <div className="col-xxl-4 col-md-6">
                <div className={"card info-card "+ ICON_HASH_FOR_SUMMERY[key][1]}>

                  <div className="card-body">
                    <h5 className="card-title">{key} <span>| Inventory</span></h5>

                    <div className="d-flex align-items-center" style={{cursor: 'default'}}>
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className={"bi " + ICON_HASH_FOR_SUMMERY[key][0]}></i>
                      </div>
                      <div className="ps-3">
                        <h6>{value}</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>

          <div className={"modal fade "} id="fullscreenModal" style={drilldownStyle}>
            <div className="modal-dialog modal-fullscreen">
              <div className="modal-content">
                <div className="modal-header">
                  <div className="pagetitle">
                    <h1>My Inventory</h1>
                  </div>
                  <button type="button" className="btn-close" onClick={this.handleHideDrillDown}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    {Object.entries(this.state.reportSummary).map(([key, value]) => {
                    return(
                      <div className="col-xxl-4 col-md-6">
                        <div className={"card info-card "+ ICON_HASH_FOR_SUMMERY[key][1]}>
                          <div className="card-body">
                            <h5 className="card-title">{key} <span>| Inventory</span></h5>
                            <div className="d-flex align-items-center">
                              <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                                <i className={"bi " + ICON_HASH_FOR_SUMMERY[key][0]}></i>
                              </div>
                              <div className="ps-3">
                                <h6>{value}</h6>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr></hr>
        </div>}
        {noRecords ? null :
        <div className="pagetitle text-center">
          <h1>BreakDown</h1>
          <br></br>
        </div>}
        {noRecords ? null : <div>{(<StaticReport items={this.state.itemsData} DataisLoaded={this.state.BreakdownDataLoaded}/>)}</div>}
      </div>
      )
  }
}
export default InventoryReport
