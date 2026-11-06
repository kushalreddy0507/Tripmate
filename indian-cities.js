// Comprehensive Indian States, Major Districts & Cities with Coordinates
const INDIAN_LOCATIONS = {
  "Andhra Pradesh": [
    {
      "name": "Visakhapatnam",
      "lat": 17.6868,
      "lon": 83.2185
    },
    {
      "name": "Vijayawada",
      "lat": 16.5062,
      "lon": 80.648
    },
    {
      "name": "Guntur",
      "lat": 16.3067,
      "lon": 80.4365
    },
    {
      "name": "Tirupati",
      "lat": 13.6288,
      "lon": 79.4192
    },
    {
      "name": "Kurnool",
      "lat": 15.8281,
      "lon": 78.0373
    },
    {
      "name": "Nellore",
      "lat": 14.4426,
      "lon": 79.9865
    },
    {
      "name": "Rajahmundry",
      "lat": 17.0005,
      "lon": 81.804
    },
    {
      "name": "Kadapa",
      "lat": 14.4673,
      "lon": 78.8242
    },
    {
      "name": "Anantapur",
      "lat": 14.6819,
      "lon": 77.6006
    },
    {
      "name": "Srisailam",
      "lat": 16.0728,
      "lon": 78.8687
    }
  ],
  "Arunachal Pradesh": [
    {
      "name": "Itanagar",
      "lat": 27.0844,
      "lon": 93.6053
    },
    {
      "name": "Tawang",
      "lat": 27.5861,
      "lon": 91.8594
    },
    {
      "name": "Ziro",
      "lat": 27.595,
      "lon": 93.834
    },
    {
      "name": "Pasighat",
      "lat": 28.066,
      "lon": 95.3263
    },
    {
      "name": "Bomdila",
      "lat": 27.2645,
      "lon": 92.4159
    }
  ],
  "Assam": [
    {
      "name": "Guwahati",
      "lat": 26.1445,
      "lon": 91.7362
    },
    {
      "name": "Silchar",
      "lat": 24.8333,
      "lon": 92.7789
    },
    {
      "name": "Dibrugarh",
      "lat": 27.4728,
      "lon": 94.912
    },
    {
      "name": "Jorhat",
      "lat": 26.7509,
      "lon": 94.2037
    },
    {
      "name": "Tezpur",
      "lat": 26.6528,
      "lon": 92.7926
    },
    {
      "name": "Kaziranga",
      "lat": 26.5775,
      "lon": 93.1711
    },
    {
      "name": "Majuli",
      "lat": 26.95,
      "lon": 94.2167
    }
  ],
  "Bihar": [
    {
      "name": "Patna",
      "lat": 25.5941,
      "lon": 85.1376
    },
    {
      "name": "Gaya",
      "lat": 24.7914,
      "lon": 85.0002
    },
    {
      "name": "Bodh Gaya",
      "lat": 24.6961,
      "lon": 84.9869
    },
    {
      "name": "Bhagalpur",
      "lat": 25.2425,
      "lon": 86.9842
    },
    {
      "name": "Muzaffarpur",
      "lat": 26.1209,
      "lon": 85.3647
    },
    {
      "name": "Nalanda",
      "lat": 25.1357,
      "lon": 85.4452
    },
    {
      "name": "Rajgir",
      "lat": 25.03,
      "lon": 85.42
    }
  ],
  "Chhattisgarh": [
    {
      "name": "Raipur",
      "lat": 21.2514,
      "lon": 81.6296
    },
    {
      "name": "Bhilai",
      "lat": 21.1938,
      "lon": 81.3509
    },
    {
      "name": "Bilaspur",
      "lat": 22.0797,
      "lon": 82.1409
    },
    {
      "name": "Jagdalpur",
      "lat": 19.074,
      "lon": 82.027
    },
    {
      "name": "Bastar",
      "lat": 19.3667,
      "lon": 81.95
    }
  ],
  "Goa": [
    {
      "name": "Panaji",
      "lat": 15.4909,
      "lon": 73.8278
    },
    {
      "name": "Margao",
      "lat": 15.2832,
      "lon": 73.9862
    },
    {
      "name": "Vasco da Gama",
      "lat": 15.3982,
      "lon": 73.8113
    },
    {
      "name": "Calangute",
      "lat": 15.5439,
      "lon": 73.7553
    },
    {
      "name": "Baga",
      "lat": 15.5553,
      "lon": 73.7517
    },
    {
      "name": "Anjuna",
      "lat": 15.5733,
      "lon": 73.741
    }
  ],
  "Gujarat": [
    {
      "name": "Ahmedabad",
      "lat": 23.0225,
      "lon": 72.5714
    },
    {
      "name": "Surat",
      "lat": 21.1702,
      "lon": 72.8311
    },
    {
      "name": "Vadodara",
      "lat": 22.3072,
      "lon": 73.1812
    },
    {
      "name": "Rajkot",
      "lat": 22.3039,
      "lon": 70.8022
    },
    {
      "name": "Gandhinagar",
      "lat": 23.2156,
      "lon": 72.6369
    },
    {
      "name": "Bhavnagar",
      "lat": 21.7645,
      "lon": 72.1519
    },
    {
      "name": "Dwarka",
      "lat": 22.2442,
      "lon": 68.9685
    },
    {
      "name": "Somnath",
      "lat": 20.888,
      "lon": 70.4012
    },
    {
      "name": "Bhuj",
      "lat": 23.242,
      "lon": 69.6669
    },
    {
      "name": "Rann of Kutch",
      "lat": 23.834,
      "lon": 69.8339
    },
    {
      "name": "Kevadia (Statue of Unity)",
      "lat": 21.838,
      "lon": 73.7191
    }
  ],
  "Haryana": [
    {
      "name": "Gurugram",
      "lat": 28.4595,
      "lon": 77.0266
    },
    {
      "name": "Faridabad",
      "lat": 28.4089,
      "lon": 77.3178
    },
    {
      "name": "Panipat",
      "lat": 29.3909,
      "lon": 76.9635
    },
    {
      "name": "Ambala",
      "lat": 30.3782,
      "lon": 76.7767
    },
    {
      "name": "Kurukshetra",
      "lat": 29.9695,
      "lon": 76.8783
    },
    {
      "name": "Karnal",
      "lat": 29.6857,
      "lon": 76.9905
    }
  ],
  "Himachal Pradesh": [
    {
      "name": "Shimla",
      "lat": 31.1048,
      "lon": 77.1734
    },
    {
      "name": "Manali",
      "lat": 32.2432,
      "lon": 77.1892
    },
    {
      "name": "Dharamshala",
      "lat": 32.219,
      "lon": 76.3234
    },
    {
      "name": "Kullu",
      "lat": 31.9579,
      "lon": 77.1095
    },
    {
      "name": "Kasauli",
      "lat": 30.9013,
      "lon": 76.9649
    },
    {
      "name": "Dalhousie",
      "lat": 32.5387,
      "lon": 75.971
    },
    {
      "name": "Spiti Valley",
      "lat": 32.2461,
      "lon": 78.0349
    },
    {
      "name": "Kasol",
      "lat": 32.01,
      "lon": 77.315
    }
  ],
  "Jharkhand": [
    {
      "name": "Ranchi",
      "lat": 23.3441,
      "lon": 85.3096
    },
    {
      "name": "Jamshedpur",
      "lat": 22.8046,
      "lon": 86.2029
    },
    {
      "name": "Dhanbad",
      "lat": 23.7957,
      "lon": 86.4304
    },
    {
      "name": "Deoghar",
      "lat": 24.4826,
      "lon": 86.7001
    },
    {
      "name": "Bokaro",
      "lat": 23.6693,
      "lon": 86.1511
    }
  ],
  "Karnataka": [
    {
      "name": "Bengaluru",
      "lat": 12.9716,
      "lon": 77.5946
    },
    {
      "name": "Mysuru",
      "lat": 12.2958,
      "lon": 76.6394
    },
    {
      "name": "Mangaluru",
      "lat": 12.9141,
      "lon": 74.856
    },
    {
      "name": "Hubballi-Dharwad",
      "lat": 15.3647,
      "lon": 75.124
    },
    {
      "name": "Hampi",
      "lat": 15.335,
      "lon": 76.46
    },
    {
      "name": "Coorg (Madikeri)",
      "lat": 12.4244,
      "lon": 75.7382
    },
    {
      "name": "Gokarna",
      "lat": 14.5479,
      "lon": 74.3188
    },
    {
      "name": "Chikmagalur",
      "lat": 13.3161,
      "lon": 75.772
    },
    {
      "name": "Udupi",
      "lat": 13.3409,
      "lon": 74.7421
    },
    {
      "name": "Belagavi",
      "lat": 15.8497,
      "lon": 74.4977
    }
  ],
  "Kerala": [
    {
      "name": "Thiruvananthapuram",
      "lat": 8.5241,
      "lon": 76.9366
    },
    {
      "name": "Kochi",
      "lat": 9.9312,
      "lon": 76.2673
    },
    {
      "name": "Kozhikode",
      "lat": 11.2588,
      "lon": 75.7804
    },
    {
      "name": "Alappuzha (Alleppey)",
      "lat": 9.4981,
      "lon": 76.3388
    },
    {
      "name": "Munnar",
      "lat": 10.0889,
      "lon": 77.0595
    },
    {
      "name": "Wayanad",
      "lat": 11.6854,
      "lon": 76.132
    },
    {
      "name": "Varkala",
      "lat": 8.7379,
      "lon": 76.7163
    },
    {
      "name": "Thekkady",
      "lat": 9.6031,
      "lon": 77.1615
    },
    {
      "name": "Kovalam",
      "lat": 8.4004,
      "lon": 76.9787
    },
    {
      "name": "Kumarakom",
      "lat": 9.6176,
      "lon": 76.4301
    }
  ],
  "Madhya Pradesh": [
    {
      "name": "Bhopal",
      "lat": 23.2599,
      "lon": 77.4126
    },
    {
      "name": "Indore",
      "lat": 22.7196,
      "lon": 75.8577
    },
    {
      "name": "Gwalior",
      "lat": 26.2183,
      "lon": 78.1828
    },
    {
      "name": "Jabalpur",
      "lat": 23.1815,
      "lon": 79.9864
    },
    {
      "name": "Ujjain",
      "lat": 23.1765,
      "lon": 75.7885
    },
    {
      "name": "Khajuraho",
      "lat": 24.8318,
      "lon": 79.9199
    },
    {
      "name": "Pachmarhi",
      "lat": 22.4674,
      "lon": 78.4346
    },
    {
      "name": "Orchha",
      "lat": 25.3512,
      "lon": 78.6433
    },
    {
      "name": "Kanha National Park",
      "lat": 22.3345,
      "lon": 80.6115
    }
  ],
  "Maharashtra": [
    {
      "name": "Mumbai",
      "lat": 19.076,
      "lon": 72.8777
    },
    {
      "name": "Pune",
      "lat": 18.5204,
      "lon": 73.8567
    },
    {
      "name": "Nagpur",
      "lat": 21.1458,
      "lon": 79.0882
    },
    {
      "name": "Nashik",
      "lat": 19.9975,
      "lon": 73.7898
    },
    {
      "name": "Aurangabad (Chhatrapati Sambhaji Nagar)",
      "lat": 19.8762,
      "lon": 75.3433
    },
    {
      "name": "Kolhapur",
      "lat": 16.705,
      "lon": 74.2433
    },
    {
      "name": "Lonavala",
      "lat": 18.7557,
      "lon": 73.4091
    },
    {
      "name": "Mahabaleshwar",
      "lat": 17.9237,
      "lon": 73.6586
    },
    {
      "name": "Shirdi",
      "lat": 19.7667,
      "lon": 74.4767
    },
    {
      "name": "Alibaug",
      "lat": 18.6414,
      "lon": 72.8722
    },
    {
      "name": "Ratnagiri",
      "lat": 16.9902,
      "lon": 73.312
    }
  ],
  "Manipur": [
    {
      "name": "Imphal",
      "lat": 24.817,
      "lon": 93.9368
    },
    {
      "name": "Loktak Lake",
      "lat": 24.55,
      "lon": 93.8
    },
    {
      "name": "Churachandpur",
      "lat": 24.3333,
      "lon": 93.6667
    }
  ],
  "Meghalaya": [
    {
      "name": "Shillong",
      "lat": 25.5788,
      "lon": 91.8933
    },
    {
      "name": "Cherrapunji (Sohra)",
      "lat": 25.2702,
      "lon": 91.7323
    },
    {
      "name": "Dawki",
      "lat": 25.1833,
      "lon": 92.0167
    },
    {
      "name": "Mawlynnong",
      "lat": 25.2023,
      "lon": 91.9077
    }
  ],
  "Mizoram": [
    {
      "name": "Aizawl",
      "lat": 23.7271,
      "lon": 92.7176
    },
    {
      "name": "Lunglei",
      "lat": 22.8833,
      "lon": 92.7333
    },
    {
      "name": "Champhai",
      "lat": 23.4733,
      "lon": 93.3283
    }
  ],
  "Nagaland": [
    {
      "name": "Kohima",
      "lat": 25.6751,
      "lon": 94.1086
    },
    {
      "name": "Dimapur",
      "lat": 25.9068,
      "lon": 93.7273
    },
    {
      "name": "Mokokchung",
      "lat": 26.325,
      "lon": 94.5167
    },
    {
      "name": "Dzukou Valley",
      "lat": 25.55,
      "lon": 94.0667
    }
  ],
  "Odisha": [
    {
      "name": "Bhubaneswar",
      "lat": 20.2961,
      "lon": 85.8245
    },
    {
      "name": "Puri",
      "lat": 19.8135,
      "lon": 85.8312
    },
    {
      "name": "Konark",
      "lat": 19.8876,
      "lon": 86.0945
    },
    {
      "name": "Cuttack",
      "lat": 20.4625,
      "lon": 85.883
    },
    {
      "name": "Rourkela",
      "lat": 22.2604,
      "lon": 84.8536
    },
    {
      "name": "Chilika Lake",
      "lat": 19.7164,
      "lon": 85.3213
    }
  ],
  "Punjab": [
    {
      "name": "Amritsar",
      "lat": 31.634,
      "lon": 74.8723
    },
    {
      "name": "Ludhiana",
      "lat": 30.901,
      "lon": 75.8573
    },
    {
      "name": "Jalandhar",
      "lat": 31.326,
      "lon": 75.5762
    },
    {
      "name": "Patiala",
      "lat": 30.3398,
      "lon": 76.3869
    },
    {
      "name": "Bathinda",
      "lat": 30.211,
      "lon": 74.9455
    }
  ],
  "Rajasthan": [
    {
      "name": "Jaipur",
      "lat": 26.9124,
      "lon": 75.7873
    },
    {
      "name": "Udaipur",
      "lat": 24.5854,
      "lon": 73.7125
    },
    {
      "name": "Jodhpur",
      "lat": 26.2389,
      "lon": 73.0243
    },
    {
      "name": "Jaisalmer",
      "lat": 26.9157,
      "lon": 70.9083
    },
    {
      "name": "Pushkar",
      "lat": 26.4897,
      "lon": 74.5511
    },
    {
      "name": "Ajmer",
      "lat": 26.4499,
      "lon": 74.6399
    },
    {
      "name": "Mount Abu",
      "lat": 24.5925,
      "lon": 72.7156
    },
    {
      "name": "Bikaner",
      "lat": 28.0229,
      "lon": 73.3119
    },
    {
      "name": "Ranthambore (Sawai Madhopur)",
      "lat": 25.9928,
      "lon": 76.3644
    },
    {
      "name": "Chittorgarh",
      "lat": 24.8887,
      "lon": 74.6269
    }
  ],
  "Sikkim": [
    {
      "name": "Gangtok",
      "lat": 27.3389,
      "lon": 88.6065
    },
    {
      "name": "Pelling",
      "lat": 27.3167,
      "lon": 88.2333
    },
    {
      "name": "Namchi",
      "lat": 27.1667,
      "lon": 88.35
    },
    {
      "name": "Lachung",
      "lat": 27.6891,
      "lon": 88.743
    }
  ],
  "Tamil Nadu": [
    {
      "name": "Chennai",
      "lat": 13.0827,
      "lon": 80.2707
    },
    {
      "name": "Coimbatore",
      "lat": 11.0168,
      "lon": 76.9558
    },
    {
      "name": "Madurai",
      "lat": 9.9252,
      "lon": 78.1198
    },
    {
      "name": "Tiruchirappalli",
      "lat": 10.7905,
      "lon": 78.7047
    },
    {
      "name": "Salem",
      "lat": 11.6643,
      "lon": 78.146
    },
    {
      "name": "Ooty",
      "lat": 11.4102,
      "lon": 76.695
    },
    {
      "name": "Kodaikanal",
      "lat": 10.2381,
      "lon": 77.4892
    },
    {
      "name": "Kanyakumari",
      "lat": 8.0883,
      "lon": 77.5385
    },
    {
      "name": "Rameswaram",
      "lat": 9.2876,
      "lon": 79.3129
    },
    {
      "name": "Mahabalipuram",
      "lat": 12.6269,
      "lon": 80.1927
    },
    {
      "name": "Thanjavur",
      "lat": 10.787,
      "lon": 79.1378
    }
  ],
  "Telangana": [
    {
      "name": "Hyderabad",
      "lat": 17.385,
      "lon": 78.4867
    },
    {
      "name": "Warangal",
      "lat": 17.9689,
      "lon": 79.5941
    },
    {
      "name": "Nizamabad",
      "lat": 18.6725,
      "lon": 78.0941
    },
    {
      "name": "Karimnagar",
      "lat": 18.4386,
      "lon": 79.1288
    },
    {
      "name": "Khammam",
      "lat": 17.2473,
      "lon": 80.1514
    }
  ],
  "Tripura": [
    {
      "name": "Agartala",
      "lat": 23.8315,
      "lon": 91.2868
    },
    {
      "name": "Udaipur (Tripura)",
      "lat": 23.5333,
      "lon": 91.4833
    },
    {
      "name": "Unakoti",
      "lat": 24.3167,
      "lon": 92.0167
    }
  ],
  "Uttar Pradesh": [
    {
      "name": "Lucknow",
      "lat": 26.8467,
      "lon": 80.9462
    },
    {
      "name": "Kanpur",
      "lat": 26.4499,
      "lon": 80.3319
    },
    {
      "name": "Varanasi",
      "lat": 25.3176,
      "lon": 82.9739
    },
    {
      "name": "Agra",
      "lat": 27.1767,
      "lon": 78.0081
    },
    {
      "name": "Prayagraj (Allahabad)",
      "lat": 25.4358,
      "lon": 81.8463
    },
    {
      "name": "Noida",
      "lat": 28.5355,
      "lon": 77.391
    },
    {
      "name": "Mathura-Vrindavan",
      "lat": 27.4924,
      "lon": 77.6737
    },
    {
      "name": "Ayodhya",
      "lat": 26.7922,
      "lon": 82.1998
    },
    {
      "name": "Meerut",
      "lat": 28.9845,
      "lon": 77.7064
    },
    {
      "name": "Jhansi",
      "lat": 25.4484,
      "lon": 78.5685
    }
  ],
  "Uttarakhand": [
    {
      "name": "Dehradun",
      "lat": 30.3165,
      "lon": 78.0322
    },
    {
      "name": "Rishikesh",
      "lat": 30.0869,
      "lon": 78.2676
    },
    {
      "name": "Haridwar",
      "lat": 29.9457,
      "lon": 78.1642
    },
    {
      "name": "Nainital",
      "lat": 29.3919,
      "lon": 79.4542
    },
    {
      "name": "Mussoorie",
      "lat": 30.4598,
      "lon": 78.0644
    },
    {
      "name": "Jim Corbett",
      "lat": 29.53,
      "lon": 78.7747
    },
    {
      "name": "Auli",
      "lat": 30.5284,
      "lon": 79.567
    },
    {
      "name": "Badrinath",
      "lat": 30.7433,
      "lon": 79.4938
    },
    {
      "name": "Kedarnath",
      "lat": 30.7352,
      "lon": 79.0669
    }
  ],
  "West Bengal": [
    {
      "name": "Kolkata",
      "lat": 22.5726,
      "lon": 88.3639
    },
    {
      "name": "Darjeeling",
      "lat": 27.041,
      "lon": 88.2663
    },
    {
      "name": "Siliguri",
      "lat": 26.7271,
      "lon": 88.3953
    },
    {
      "name": "Asansol",
      "lat": 23.6739,
      "lon": 86.9524
    },
    {
      "name": "Durgapur",
      "lat": 23.5204,
      "lon": 87.3119
    },
    {
      "name": "Sundarbans",
      "lat": 21.9497,
      "lon": 89.1833
    },
    {
      "name": "Digha",
      "lat": 21.6266,
      "lon": 87.5074
    },
    {
      "name": "Kalimpong",
      "lat": 27.0667,
      "lon": 88.4667
    }
  ],
  "Delhi (NCT)": [
    {
      "name": "New Delhi",
      "lat": 28.6139,
      "lon": 77.209
    },
    {
      "name": "Old Delhi (Chandni Chowk)",
      "lat": 28.6506,
      "lon": 77.2303
    },
    {
      "name": "South Delhi",
      "lat": 28.5402,
      "lon": 77.2155
    },
    {
      "name": "Dwarka (Delhi)",
      "lat": 28.5921,
      "lon": 77.046
    }
  ],
  "Jammu and Kashmir": [
    {
      "name": "Srinagar",
      "lat": 34.0837,
      "lon": 74.7973
    },
    {
      "name": "Jammu",
      "lat": 32.7266,
      "lon": 74.857
    },
    {
      "name": "Gulmarg",
      "lat": 34.0484,
      "lon": 74.3805
    },
    {
      "name": "Pahalgam",
      "lat": 34.0167,
      "lon": 75.3167
    },
    {
      "name": "Sonamarg",
      "lat": 34.3167,
      "lon": 75.3
    },
    {
      "name": "Patnitop",
      "lat": 33.0833,
      "lon": 75.3333
    }
  ],
  "Ladakh": [
    {
      "name": "Leh",
      "lat": 34.1526,
      "lon": 77.5771
    },
    {
      "name": "Kargil",
      "lat": 34.5539,
      "lon": 76.131
    },
    {
      "name": "Nubra Valley (Diskit)",
      "lat": 34.5428,
      "lon": 77.562
    },
    {
      "name": "Pangong Tso",
      "lat": 33.7595,
      "lon": 78.6674
    },
    {
      "name": "Zanskar",
      "lat": 33.4833,
      "lon": 76.8833
    }
  ],
  "Andaman and Nicobar Islands": [
    {
      "name": "Port Blair",
      "lat": 11.6234,
      "lon": 92.7265
    },
    {
      "name": "Havelock Island (Swaraj Dweep)",
      "lat": 11.9761,
      "lon": 92.9876
    },
    {
      "name": "Neil Island (Shaheed Dweep)",
      "lat": 11.8333,
      "lon": 93.05
    }
  ],
  "Chandigarh": [
    {
      "name": "Chandigarh",
      "lat": 30.7333,
      "lon": 76.7794
    }
  ],
  "Puducherry": [
    {
      "name": "Puducherry (Pondicherry)",
      "lat": 11.9416,
      "lon": 79.8083
    },
    {
      "name": "Auroville",
      "lat": 12.007,
      "lon": 79.8106
    }
  ],
  "Daman and Diu": [
    {
      "name": "Daman",
      "lat": 20.4283,
      "lon": 72.8397
    },
    {
      "name": "Diu",
      "lat": 20.7144,
      "lon": 70.9874
    }
  ]
};
