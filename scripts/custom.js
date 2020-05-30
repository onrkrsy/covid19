    var rselectedCountryName="Türkiye";
    var rselectedCountryCode="turkey";
    $(function() {
        
        console.log("başladı");
        Initial();
    });
    function Initial() {
        moment.locale('tr');
        GetSummary(); 
        GetStatusByCountry("Turkey");
        //GetChartStatusByCountry();
        CompareStatus("Turkey","confirmed","Türkiye")
       
       
    }
    function ButtonClicks() {
        $(".btnCountryName").on("click", function(){
           
         
            var countryCode = this.getAttribute('data-countryCode');
            var countryName = this.getAttribute('data-countryName');
            $(".list-group-item").removeClass("active");
            $(this).parent(".list-group-item").addClass("active");
            rselectedCountryName = countryName;
            rselectedCountryCode = countryCode;
           

            $('.hCountryName').text(countryName);

            GetStatusByCountry(countryCode);
            CompareStatus(countryCode,"confirmed",countryName)
            GetRateCharts(countryCode,countryName);
            scroolToElement("countryDatasBlock");
        });

        $(".afilter").on("click", function(){
            console.log("clicked");
            var filterType = this.getAttribute('data-filter'); 
            var cn = rselectedCountryName;
            var cc = rselectedCountryCode;
        
           
            
            CompareStatus(cc,filterType,cn);
            
        }); 


    }
    
    function scroolToElement(elemId) {
        var elmnt = document.getElementById(elemId);
        elmnt.scrollIntoView({ behavior: 'smooth'});
      }
    

    function GetSummary() {
       var htmlCountryList = "";
       var totalCase=0;
       var totalDeath=0;
       var totalRecovered=0;
        var mapData = "";
        var arr=[];  
        $.getJSON( "https://api.covid19api.com/summary", {  })
            .done(function(summary) { 
                sortContries=summary.Countries;
                var prop = "TotalConfirmed";
                sortContries.sort(function(a, b) { 
                        return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0); 
                });
                
                sortContries.forEach(function(item,i){
                    if(item.Slug === "turkey"){
                        sortContries.splice(i, 1);
                        sortContries.unshift(item);
                    }
                  });
                var fclass="";
                $.each( sortContries, function( i, item ) {
              
                if(item.Slug == "turkey") {flcass="active";} else {flcass="";}
               // var single = [item.Country, item.TotalConfirmed, "<div><b>Toplam Vaka :</b> "+item.TotalConfirmed+"</div><div><b>Tedavi Edilen Vaka :</b> "+item.TotalRecovered+"</div> <div><b>Kaybedilen Vaka :</b>"+item.TotalDeaths+"</div>"];
                var countryListItem = "<li class='list-group-item "+flcass+"'> <a class='block _500 btnCountryName' data-countryCode='"+item.Slug+"' data-countryName='"+item.Country+"' data-deaths='"+item.TotalDeaths+"' data-recovered='"+item.TotalRecovered+"' data-confirmed='"+item.TotalConfirmed+"' ><span class='countryName'>"+item.Country+" </span><div class=''>"+
                "<table width='100%'><tr><td colspan='2'><span><span class='text-danger'><i class='fa fa-circle text-xs'></i></span> <span class='txt-small'> ÖLÜM : <span class='deathCount'>"+item.TotalDeaths+"</span></span></span><br>"+
                "<span><span class=' text-success'><i class='fa fa-circle text-xs'></i></span> <span class='txt-small'>TEDAVİ : <span class='recoveredCount'>"+item.TotalRecovered+"</span></span></span></td>"+
                "<td class='text-right'><span><span class=' text-warning'><i class='fa fa-circle text-xs'></i></span> TOPLAM : <span class='confirmedCount'>"+item.TotalConfirmed+"</span></span></td></tr></table>"+
                "</div></a> </li>";        
                htmlCountryList +=countryListItem;
          
                totalCase +=item.TotalConfirmed;
                totalDeath+=item.TotalDeaths;
                totalRecovered += item.TotalRecovered; 
                arr.push({name : item.Country, value : item.TotalConfirmed, death:item.TotalDeaths, recovered:item.TotalRecovered});
             

            });
            $("#countryList").append(htmlCountryList); 
            $("#spnTotalCase").html(totalCase.toLocaleString());
            $("#spnTotalRecovered").html(totalRecovered.toLocaleString());
            $("#spnTotalDeath").html(totalDeath.toLocaleString());         
            $(".divCountryList .ajax_partloader").hide(); 
            SummarySearch();

            
            GetMap(arr);
            ButtonClicks();
            GetRateCharts("turkey","Türkiye");
        });    
    }
    function SummarySearch(){

          var options = {
            valueNames: [ 'countryName', 'deathCount','recoveredCount','confirmedCount' ],
            listClass:'countryList',
            searchClass :'search',
            sort:'desc'
          };
          
          var userList = new List('divCountryList', options);


    }

    function GetMap(mapdata){ 

        var chart = echarts.init(document.getElementById('mainMap'));

        option = {
            title : {
                
            },
            tooltip : {
                trigger: 'item',
                formatter : function (params) {
                   // console.log(params);                   
                   if(params.value!='-') {
                    var value2=params.data.value2;        
                    return  params.name + '<br>Toplam Vaka : ' + params.value +"<br> Tedavi Edilen : "+params.data.recovered + " <br>Ölümle Sonuçlanan : "+params.data.death;
                   }else {return params.name }
                }
            },
            dataRange: {
                min: 0,
                max: 200000,
                text:['High','Low'],
                realtime: false,
                calculable : true,
                color: [ 'orangered','#f9615d','#efe1d8']
            },
            series : [
                {
                    name: '',
                    type: 'map',
                    mapType: 'world',
                    roam: true,
                    mapLocation: {
                        y : 60
                    },
                    itemStyle:{
                        emphasis:{label:{show:true}}
                    },
                    data: mapdata
                
                }
            ]
        } 
        chart.setOption(option);
    }

    function GetStatusByCountry(selectedCountry){
        console.log("GetStatusByCountry"); 
        var jsonDeaths="";
        var jsonConfirmed="";
        var jsonRecovered = "";
        $.getJSON( "https://api.covid19api.com/total/dayone/country/"+selectedCountry+"/status/confirmed", {  })
        .done(function(casesconfirmed) {
      
            jsonConfirmed = casesconfirmed;
                $.getJSON( "https://api.covid19api.com/total/dayone/country/"+selectedCountry+"/status/deaths", {  })
                .done(function(casescondeaths) {     
                jsonDeaths = casescondeaths;
                    $.getJSON( "https://api.covid19api.com/total/dayone/country/"+selectedCountry+"/status/recovered", {  })
                    .done(function(casesrecovered) {   
                    jsonRecovered = casesrecovered; 
                    GetStatusByCountryDatas(jsonConfirmed,jsonDeaths,jsonRecovered);
                    });
                }); 
        }); 
        
    }
    function GetStatusByCountryDatas(jsonConfirmed,jsonDeaths,jsonRecovered) {
           
        var firstDate =moment('2019-12-28T00:00:00Z');
        var now = moment(new Date());     
        if(jsonConfirmed != null) {firstDate = moment(jsonConfirmed[0].Date) ;}     
        var dayCounts = now.diff(firstDate, 'days')+1 
        var arrLabels = [];
        var arrConfirmed = [];
        var arrDeaths = [];
        var arrRecovered = [];      
        for(i=1; i<=dayCounts; i++) {
            var fdate = firstDate;
            if(i==1) arrLabels.push(fdate.format('L'));
            else arrLabels.push(fdate.add(1, 'days').format('L'));   
        }
     
            if (jsonConfirmed!='null')  { $.each( jsonConfirmed, function( i, item ) {
                var itemDate =  moment(item.Date).format('L');
                var arrLabelIndex = arrLabels.indexOf(itemDate);          
                arrConfirmed[arrLabelIndex] = item.Cases;
            });
            }
        
            if (jsonDeaths!='null')  { $.each( jsonDeaths, function( i, item ) {
                var itemDate =  moment(item.Date).format('L');
                var arrLabelIndex = arrLabels.indexOf(itemDate);          
                arrDeaths[arrLabelIndex] = item.Cases;
            });
            }
            if (jsonRecovered!='null')  { $.each( jsonRecovered, function( i, item ) {
                var itemDate =  moment(item.Date).format('L');
                var arrLabelIndex = arrLabels.indexOf(itemDate);          
                arrRecovered[arrLabelIndex] = item.Cases;
            });
            }
            GetChartStatusByCountry(arrLabels,arrConfirmed,arrDeaths,arrRecovered);
    }
  
    function GetChartStatusByCountry(arrLabels, arrConfirmed, arrDeaths, arrRecovered){
        resetCanvas("chartGetStatus");
        myLineChart =  new Chart(document.getElementById("chartGetStatus"), {
            type: 'bar',
            data: {
                labels: arrLabels,
                datasets: [
                  {
                      label: 'Toplam Vaka',
                      type: 'line',
                      data: arrConfirmed,
                      fill: true,
                      backgroundColor: 'rgba(75,192,192,0.2)',
                      borderColor: 'rgba(75,192,192,1)',
                      borderWidth: 2,
                      borderJoinStyle: 'miter',
                      pointBorderColor: 'rgba(75,192,192,1)',
                      pointBackgroundColor: '#fff',
                      pointBorderWidth: 2,
                      pointHoverRadius: 2,
                      pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                      pointHoverBorderColor: '#fff',
                      pointHoverBorderWidth: 2,
                      pointRadius: 3
                  },
                  {
                      label: 'Tedavi Edilen Vaka',
                      type: 'line',
                      data: arrRecovered,
                      fill: false,
                      borderDash: [3, 3],
                      backgroundColor: 'rgba(255,206,86,0.7)',
                      borderColor: 'rgba(255,206,86,1)',
                      borderWidth: 2,
                      borderJoinStyle: 'miter',
                      pointBorderColor: '#fff',
                      pointBackgroundColor: 'rgba(255,206,86,1)',
                      pointBorderWidth: 2,
                      pointHoverRadius: 2,
                      pointHoverBackgroundColor: 'rgba(255,206,86,1)',
                      pointHoverBorderColor: '#fff',
                      pointHoverBorderWidth: 2,
                      pointRadius: 3
                  }, 
                   {
                    label: 'Ölümcül Vaka',
                    type: 'line',
                    data: arrDeaths,
                    fill: false,
                    borderDash: [3, 3],
                    backgroundColor: 'rgba(255,99,132,0.7)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 2,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#fff',
                    pointBackgroundColor: 'rgba(255,99,132,1)',
                    pointBorderWidth: 2,
                    pointHoverRadius: 2,
                    pointHoverBackgroundColor: 'rgba(255,99,132,1)',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                    pointRadius: 3
                }
                ]
            },
            options: {
            }
        })


    }

    function CompareStatus(selectedCountry,selectedStatus,selectedCountryName) {
        
        var jsonSelected="";      
        var jsonUsa ="";
        var jsonItaly = "";
        var jsonSpain = "";
        var strfilter = "";
        if(selectedStatus == "confirmed") strfilter = "Toplam Vaka Sayısı";
        else if(selectedStatus == "deaths") strfilter = "Ölümcül Vaka Sayısı";
        else if(selectedStatus == "recovered") strfilter = "Tedavi Edilen Vaka Sayısı";
            
        $('.hFilterName').text(strfilter);



        $.getJSON( "https://api.covid19api.com/total/dayone/country/united-states/status/"+selectedStatus+"", {  })
        .done(function(ccases) { 
            jsonUsa = ccases;  
            $.getJSON( "https://api.covid19api.com/total/dayone/country/italy/status/"+selectedStatus+"", {  })
            .done(function(icases) { 
                jsonItaly = icases;  
                    $.getJSON( "https://api.covid19api.com/total/dayone/country/spain/status/"+selectedStatus+"", {  })
                    .done(function(kcases) { 
                        jsonSpain= kcases;  
                            $.getJSON( "https://api.covid19api.com/total/dayone/country/"+selectedCountry+"/status/"+selectedStatus+"", {  })
                            .done(function(scases) { 
                                jsonSelected = scases;   

                                var firstDate =moment('2020-01-22T00:00:00Z');
                                var now = moment(new Date());     
                                //if(jsonChina != 'null') {firstDate = moment(jsonChina[0].Date) ;}     
                                var dayCounts = now.diff(firstDate, 'days')+1 
                                var arrLabels = [];
                                var arrUsa = [];
                                var arrItaly = [];
                                var arrSpain = [];  
                                var arrSelected = [];         
                                for(i=1; i<=dayCounts; i++) {
                                    var fdate = firstDate;
                                    if(i==1) arrLabels.push(fdate.format('L'));
                                    else arrLabels.push(i+".GUN");   
                                }
                                arrUsa= GetCompareDatas(arrLabels,jsonUsa);
                                arrItaly = GetCompareDatas(arrLabels,jsonItaly);
                                arrSpain = GetCompareDatas(arrLabels,jsonSpain);
                                arrSelected = GetCompareDatas(arrLabels,jsonSelected);
                                var slicecount = 20;
                                if(arrSelected.length > 0)  slicecount = arrSelected.length+10;                                

                                GetChartCompareByCountry(arrLabels.slice(0,slicecount),arrUsa.slice(0,slicecount),arrItaly.slice(0,slicecount),arrSpain.slice(0,slicecount),arrSelected,selectedCountryName)


                            }); 
                    }); 
            }); 
        }); 
      
      
       
    }
    
    function GetCompareDatas(arrLabels,jsonData) {
      
        
        arrResult =[];
            var firstDate =moment('2020-01-22T00:00:00Z');
            if(!(jsonData == 'null' || jsonData=="" || jsonData.length==undefined))  {firstDate = moment(jsonData[0].Date) ;}  

            if (!(jsonData == 'null' || jsonData==""))  { $.each( jsonData, function( i, item ) { 
                var dayCounts = (moment(item.Date).diff(firstDate, 'days'))+1
                var strDayCount=dayCounts+".GUN";
                var arrLabelIndex = arrLabels.indexOf(strDayCount);          
                arrResult[arrLabelIndex] = item.Cases;
            });
            }
            return arrResult;
    }


    function GetChartCompareByCountry(arrLabels, arrUsa, arrItaly, arrSpain, arrSelected, selectedCountryName){
        resetCanvas("chartCompare");
        new Chart(document.getElementById("chartCompare"), {
            type: 'bar',
            data: {
                labels: arrLabels,
                datasets: [
                  {
                      label: 'Amerika',
                      type: 'line',
                      data: arrUsa,
                      fill: false,
                      backgroundColor: 'rgba(75,192,192,0.2)',
                      borderColor: 'rgba(75,192,192,1)'
                      
                  },
                  {
                      label: 'İtalya',
                      type: 'line',
                      data: arrItaly,
                      fill: false,
                      borderDash: [3, 3],
                      backgroundColor: 'rgba(255,206,86,0.7)',
                      borderColor: 'rgba(255,206,86,1)',
                      borderWidth: 2,
                      borderJoinStyle: 'miter',
                      pointBorderColor: '#fff',
                      pointBackgroundColor: 'rgba(255,206,86,1)',
                      pointBorderWidth: 2,
                      pointHoverRadius: 2,
                      pointHoverBackgroundColor: 'rgba(255,206,86,1)',
                      pointHoverBorderColor: '#fff',
                      pointHoverBorderWidth: 2,
                      pointRadius: 3
                  }, 
                   {
                    label: 'İspanya',
                    type: 'line',
                    data: arrSpain,
                    fill: false,
                    borderDash: [3, 3],
                    backgroundColor: 'rgba(34,182,110,0.7)',
                    borderColor: 'rgba(34,182,110,1)',
                    borderWidth: 2,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#fff',
                    pointBackgroundColor: 'rgba(34,182,110,1)',
                    pointBorderWidth: 2,
                    pointHoverRadius: 2,
                    pointHoverBackgroundColor: 'rgba(34,182,110,1)',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                    pointRadius: 3
                },
                {
                    label: selectedCountryName,
                    type: 'line',
                    data: arrSelected,
                    fill: false,
                    borderDash: [3, 3],
                    backgroundColor: 'rgba(255,99,132,0.7)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 2,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#fff',
                    pointBackgroundColor: 'rgba(255,99,132,1)',
                    pointBorderWidth: 2,
                    pointHoverRadius: 2,
                    pointHoverBackgroundColor: 'rgba(255,99,132,1)',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                    pointRadius: 3
                }
                ]
            },
            options: {
            }
        })


    }

     function resetCanvas(canvasId) {
        
       var wt =  $('#ch'+canvasId).width();
       var ht =  $('#ch'+canvasId).height();
        $('#'+canvasId).remove(); // this is my <canvas> element
        $('#ch'+canvasId).append('<canvas id="'+canvasId+'"><canvas>');     
        canvas = document.querySelector('#'+canvasId); // why use jQuery?
        ctx = canvas.getContext('2d');
        ctx.canvas.width = wt; // resize to parent width
        ctx.canvas.height = ht; // resize to parent height
      };


    function GetRateCharts(selectedCountryCode,selectedCountryName) {
        resetCanvas("chartDeathRates");
        resetCanvas("chartRecoveredRates");
        var arrLabels = ["Amerika","İtalya","İspanya","Almanya",selectedCountryName];
        var arrCodes = ["united-states","italy","spain","germany",selectedCountryCode];
        var arrData = [];
        var arrDataRecovered = [];
        $.each(arrCodes, function( index, value ) {
            console.log(value);
           var htmla = $("[data-countryCode='" + value + "']");
           console.log(htmla);
           var totalCase = htmla.data('confirmed');
           var totalDeath = htmla.data('deaths');
           var totalRecovered = htmla.data('recovered');
        
           var deathRate = ((totalDeath/totalCase)*100).toFixed(3);
           var recoveredRate = ((totalRecovered/totalCase)*100).toFixed(3);
           arrData.push(deathRate);
           arrDataRecovered.push(recoveredRate);
        });
        console.log(arrData);
        


        new Chart(document.getElementById("chartDeathRates"), {
              type: 'bar',
              data: {
                  labels: arrLabels,
                  datasets: [
                      {
                          label: 'Ölüm Oranı',
                          data: arrData,
                          fill: true,
                          backgroundColor: 'rgba(255,99,132,0.7)',
                          borderColor: 'rgba(255,99,132,1)',
                          borderWidth: 2
                      }
                  ]
              },
              options: {
                stacked: true
              }
            
           
        });
        new Chart(document.getElementById("chartRecoveredRates"), {
            type: 'bar',
            data: {
                labels: arrLabels,
                datasets: [
                    {
                        label: 'Tedavi Edilme Oranı',
                        data: arrDataRecovered,
                        fill: true,
                        backgroundColor: 'rgba(255,206,86,0.7)',
                        borderColor: 'rgba(255,206,86,1)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
              stacked: true
            },
            tooltips: {
                callbacks: {
                  label: function(tooltipItem, data) {
                    return data['labels'][tooltipItem['index']] + ': ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
                  }
                }
              }
          
         
      });


    }  