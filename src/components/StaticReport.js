import React, { Component } from "react";
import Table from "react-bootstrap/Table";
import { ColorRing } from "react-loader-spinner";

class StaticReport extends Component {
  render() {
    const { DataisLoaded, items } = this.props;
    function colorgenerator(totalAmountArr) {
      let min = 0,
        max = 0;
      for (let i = 0; i < totalAmountArr.length; i++) {
        if (totalAmountArr[i] > max) {
          max = totalAmountArr[i];
        }
        if (totalAmountArr[i] < min) {
          min = totalAmountArr[i];
        }
      }
      let colors = [
        "rgb(255, 0, 0)",
        "rgb(255, 64, 0)",
        "rgb(255, 128, 0)",
        "rgb(255, 191, 0)",
        "rgb(255, 255, 0)",
        "rgb(191, 255, 0)	",
        "rgb(128, 255, 0)",
        "rgb(64, 255, 0)",
      ];
      // let color = 'rgb('+
    }
    if (!DataisLoaded)
      return (
        <div className="row">
          <ColorRing
            visible={true}
            height="60"
            width="60"
            ariaLabel="blocks-loading"
            wrapperStyle={{}}
            wrapperClass="blocks-wrapper"
            colors={["#00319f", "#2e56b1", "#5c7bc2", "#8aa1d3", "#b2c1e2"]}
          />
          <div className="align-items-center justify-content-center">
            <h3 className=" text-center"> Please wait... </h3>
          </div>
        </div>
      );

    return (
      <div className="row">
        {Object.entries(items).map(([key, value]) => {
          return (
            <div className="col-sm-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{key.toUpperCase()}</h5>
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Count</th>
                        <th scope="col">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {value.map((element) => {
                        return (
                          <tr
                            style={{
                              backgroundColor: colorgenerator(
                                element.total_amount
                              ),
                            }}
                          >
                            <td scope="row" style={{ textAlign: "left" }}>
                              {element.name}
                            </td>
                            <td scope="row">{element.count}</td>
                            <td scope="row">
                              {element.total_amount.slice(0, -3)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default StaticReport;
