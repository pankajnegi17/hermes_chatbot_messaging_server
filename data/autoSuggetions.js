const  auto_suggested_questions_hp = [
    {
      name: 'How many employees come to office on 21st September?',
      year: 1972
    },
    {
      name: 'Employees present on 21st September',
      year: 2012
    }, 
    {
      name: 'Employees present on september 21st?',
      year: 1972
    },
    {
      name: 'What is the count of employees on 21st sep',
      year: 2012
    },
    {
      name: 'How many employees are there whose age is above 40',
      year: 2012
    }  ,
    {
      name: 'List of employees aged greater than 40',
      year: 2012
    }  ,
    {
      name: 'Please show how many employee present on 24th september 2020 by Department',
      year: 2012
    }  ,
    {
      name: 'Please show how many employee came to office on 24th september 2020 in each department',
      year: 2012
    }  ,
    {
      name: 'Please show employee based on work experience',
      year: 2012
    }  ,
    {
      name: 'Please show employees with their work experience',
      year: 2012
    }  ,
    {
      name: 'Work experience of Septiana Iskandar',
      year: 2012
    }  ,
    {
      name: 'Septiana Iskandar work experience',
      year: 2012
    }  ,
    {
      name: 'How many employee came to office each day between 20th sept 2020 and sept 25th 2020',
      year: 2012
    }  ,
    {
      name: 'How many employees came to office regularly between sep 20th to 25th',
      year: 2012
    }  ,
    {
      name: 'How many employees came to office daily between sep 20th to 25th',
      year: 2012
    }  ,
    {
      name: 'Show the list of employees coming late to ofc on 25/9/2020',
      year: 2012
    }  ,
    {
      name: 'how many employee absent on 29th sept 2020 BU wise',
      year: 2012
    }  ,
    {
      name: 'How many employees are there in different department',
      year: 2012
    }  ,
    {
      name: 'Number of employees in different department',
      year: 2012
    }  ,
    {
      name: 'List of employees by department',
      year: 2012
    }  ,
    {
      name: 'How many employees are there in different ors_structure',
      year: 2012
    } 
  ];

const auto_suggested_questions_fp  = [
  {
    name: 'Show Labour cost per cost-center',
    year: 2012
  }, 
  {
    name: 'what is labour cost per cost center',
    year: 2012
  },  
   {
    name: 'labour cost per cost center',
    year: 2012
  }, 
    {
    name: 'Total Labour cost based on cost center',
    year: 2012
  }, 
  {
    name: 'Show Labour Cost by CC',
    year: 2012
  }, 
  {
    name: 'what is labour cost per cc',
    year: 2012
  }, 
  {
    name: 'labour cost per cc',
    year: 2012
  }, 
  {
    name: 'Total Labour cost based on cc',
    year: 2012
  }, 
  {
    name: 'Show labour cost by payroll type',
    year: 2012
  }, 
  {
    name: 'Total Labour cost based on payroll type',
    year: 2012
  }, 
  {
    name: 'Show labour cost by employee bank',
    year: 2012
  }, 
  {
    name: 'Total Labour cost based on employee bank',
    year: 2012
  }, 
  {
    name: 'Show labour cost by recversion',
    year: 2012
  }, 
  {
    name: 'Total Labour cost based on recversion',
    year: 2012
  }, 
  {
    name: 'Show labour cost by Journal ID',
    year: 2012
  }, 
  {
    name: 'show labour cost by journal number',
    year: 2012
  }, 
  {
    name: 'Show labour cost per payroll type for each CC',
    year: 2012
  }, 
  {
    name: 'Show labour cost per employee bank for each CC',
    year: 2012
  }, 
  {
    name: 'Show labour cost per Journal ID for each CC',
    year: 2012
  }  
]

const auto_suggested_questions_hp_admin =[{
  name: 'admin question for hr',
  year: 2012
}]

const auto_suggested_questions_fp_admin =[  {
  name: 'Show Revenue by month',
  year: 2012
},
{
  name: 'Show Revenue by Year',
  year: 2012
},{
  name: 'Which month in year 2019 recorded the lowest revenue?',
  year: 2012
},{
  name: 'Which month in year 2020 recorded the lowest revenue?',
  year: 2012
},{
  name: 'Which month in year 2019 recorded the highest revenue?',
  year: 2012
},{
  name: 'Which month in year 2020 recorded the highest revenue?',
  year: 2012
},{
  name: 'Show Gross Margin by month',
  year: 2012
},{
  name: 'Show Gross Margin by Year ',
  year: 2012
},{
  name: 'Gross margin was lowest in which month of 2019?',
  year: 2012
},{
  name: 'Gross margin was lowest in which month of 2020?',
  year: 2012
},{
  name: 'Gross margin was highest in which month of 2019?',
  year: 2012
},{
  name: 'Gross margin was lowest in which month of 2020?',
  year: 2012
},]

const getQuestionsList = function(userType, domain){
  if(domain == "hr_pro"){
    if (userType == "admin")return auto_suggested_questions_hp.concat(auto_suggested_questions_hp_admin)
    else return auto_suggested_questions_hp
  }

  if(domain == "hr_finance"){
    if (userType == "admin")return auto_suggested_questions_fp.concat(auto_suggested_questions_fp_admin)
    else return auto_suggested_questions_fp
  }

  else{
    return []
  }
}

module.exports.auto_suggested_questions_hp=auto_suggested_questions_hp;
module.exports.auto_suggested_questions_fp=auto_suggested_questions_fp;
module.exports.getQuestionsList = getQuestionsList


