import type { WardrobeItem } from "@/domain/types";

/**
 * Product photography for the demo wardrobe, sourced from Unsplash (Unsplash License).
 * Images are hotlinked from images.unsplash.com as the Unsplash API guidelines require,
 * and every photo is credited to its photographer in the UI and in the README.
 * Items without a suitable clean product shot keep their generated cutout.
 * `overrides` align an item's attributes with what the photo actually shows.
 */
export interface SeedPhoto {
  id: string;
  raw: string;
  color: string | null;
  alt: string;
  credit: { name: string; username: string; profileUrl: string; photoUrl: string };
}

export const SEED_PHOTOS: Record<string, { photo: SeedPhoto; overrides: Partial<WardrobeItem> }> = {
  "itm_tee_black": {
    "photo": {
      "id": "6Nub980bI3I",
      "raw": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8M3x8YmxhY2slMjB0LXNoaXJ0JTIwcHJvZHVjdHxlbnwxfHx8fDE3OTQ4NzUwMDF8MA&ixlib=rb-4.1.0",
      "color": "#f3f3f3",
      "credit": {
        "name": "Ryan Hoffman",
        "username": "ryanhoffman007",
        "profileUrl": "https://unsplash.com/@ryanhoffman007",
        "photoUrl": "https://unsplash.com/photos/black-crew-neck-t-shirt-6Nub980bI3I"
      },
      "alt": "black crew neck t-shirt"
    },
    "overrides": {}
  },
  "itm_tee_graphic": {
    "photo": {
      "id": "u6n1HrW0sdQ",
      "raw": "https://images.unsplash.com/photo-1618354691438-25bc04584c23?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MTB8fGJsYWNrJTIwdC1zaGlydCUyMHByb2R1Y3R8ZW58MXx8fHwxNzk0ODc1MDAxfDA&ixlib=rb-4.1.0",
      "color": "#f3f3f3",
      "credit": {
        "name": "Ryan Hoffman",
        "username": "ryanhoffman007",
        "profileUrl": "https://unsplash.com/@ryanhoffman007",
        "photoUrl": "https://unsplash.com/photos/black-and-white-crew-neck-t-shirt-u6n1HrW0sdQ"
      },
      "alt": "black and white crew neck t-shirt"
    },
    "overrides": {
      "mainColor": "black",
      "secondaryColors": [
        "white"
      ]
    }
  },
  "itm_polo_knit": {
    "photo": {
      "id": "Y-00g_VgQTc",
      "raw": "https://images.unsplash.com/photo-1625910513394-ea511bed44ca?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8NHx8a25pdCUyMHBvbG8lMjBzaGlydHxlbnwxfHx8fDE3OTQ4NzUwMDN8MA&ixlib=rb-4.1.0",
      "color": "#8ca68c",
      "credit": {
        "name": "Clément Vatte",
        "username": "clement_vatte",
        "profileUrl": "https://unsplash.com/@clement_vatte",
        "photoUrl": "https://unsplash.com/photos/gray-polo-shirt-on-blue-textile-Y-00g_VgQTc"
      },
      "alt": "gray polo shirt on blue textile"
    },
    "overrides": {
      "mainColor": "stone",
      "secondaryColors": []
    }
  },
  "itm_knit_navy": {
    "photo": {
      "id": "NA9dtyWAFV4",
      "raw": "https://images.unsplash.com/photo-1611312449297-a69dc9c3987b?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MTF8fG5hdnklMjBzd2VhdGVyfGVufDF8fHx8MTc5NDg3NTAwNHww&ixlib=rb-4.1.0",
      "color": "#0c2626",
      "credit": {
        "name": "Caio Coelho",
        "username": "smokthebikini",
        "profileUrl": "https://unsplash.com/@smokthebikini",
        "photoUrl": "https://unsplash.com/photos/black-sweater-on-white-clothes-hanger-NA9dtyWAFV4"
      },
      "alt": "black sweater on white clothes hanger"
    },
    "overrides": {}
  },
  "itm_knit_ecru": {
    "photo": {
      "id": "m2chM9O-ZHs",
      "raw": "https://images.unsplash.com/photo-1687275161342-8699c61e4364?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MTR8fGNyZWFtJTIwa25pdCUyMHN3ZWF0ZXJ8ZW58MXx8fHwxNzk0ODc1MDA0fDA&ixlib=rb-4.1.0",
      "color": "#d9d9d9",
      "credit": {
        "name": "Ihor Rapita",
        "username": "rapitaihor",
        "profileUrl": "https://unsplash.com/@rapitaihor",
        "photoUrl": "https://unsplash.com/photos/a-white-sweater-hanging-on-a-clothes-rack-m2chM9O-ZHs"
      },
      "alt": "a white sweater hanging on a clothes rack"
    },
    "overrides": {
      "mainColor": "white",
      "name": "Chunky Knit Sweater"
    }
  },
  "itm_shirt_oxford": {
    "photo": {
      "id": "HGqPrIJAOBY",
      "raw": "https://images.unsplash.com/photo-1732605559386-bc59426d1b16?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MTJ8fGxpZ2h0JTIwYmx1ZSUyMGJ1dHRvbiUyMGRvd24lMjBzaGlydHxlbnwxfHx8fDE3OTQ4NzUwMDV8MA&ixlib=rb-4.1.0",
      "color": "#d9c0a6",
      "credit": {
        "name": "Neakasa",
        "username": "neakasa",
        "profileUrl": "https://unsplash.com/@neakasa",
        "photoUrl": "https://unsplash.com/photos/a-blue-shirt-hanging-on-a-wooden-stand-HGqPrIJAOBY"
      },
      "alt": "A blue shirt hanging on a wooden stand"
    },
    "overrides": {}
  },
  "itm_shirt_white": {
    "photo": {
      "id": "hMMXhKSZk7k",
      "raw": "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MXx8d2hpdGUlMjBkcmVzcyUyMHNoaXJ0JTIwaGFuZ2VyfGVufDF8fHx8MTc5NDg3NTAwNXww&ixlib=rb-4.1.0",
      "color": "#f3c08c",
      "credit": {
        "name": "Nimble Made",
        "username": "nimblemade",
        "profileUrl": "https://unsplash.com/@nimblemade",
        "photoUrl": "https://unsplash.com/photos/white-button-up-shirt-on-clothes-hanger-hMMXhKSZk7k"
      },
      "alt": "white button up shirt on clothes hanger"
    },
    "overrides": {}
  },
  "itm_shirt_flannel": {
    "photo": {
      "id": "xFmXLq_KJxg",
      "raw": "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MXx8cGxhaWQlMjBmbGFubmVsJTIwc2hpcnR8ZW58MXx8fHwxNzk0ODc1MDA2fDA&ixlib=rb-4.1.0",
      "color": "#262626",
      "credit": {
        "name": "Caio Coelho",
        "username": "smokthebikini",
        "profileUrl": "https://unsplash.com/@smokthebikini",
        "photoUrl": "https://unsplash.com/photos/black-and-gray-checkered-dress-shirt-xFmXLq_KJxg"
      },
      "alt": "black and gray checkered dress shirt"
    },
    "overrides": {
      "name": "Buffalo Check Flannel",
      "mainColor": "black",
      "secondaryColors": [
        "white"
      ]
    }
  },
  "itm_shirt_camp": {
    "photo": {
      "id": "S4f4apZd-hA",
      "raw": "https://images.unsplash.com/photo-1713881587420-113c1c43e28a?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8M3x8bGluZW4lMjBzaGlydHxlbnwxfHx8fDE3OTQ4NzUwMDd8MA&ixlib=rb-4.1.0",
      "color": "#d9d9d9",
      "credit": {
        "name": "tian dayong",
        "username": "tonnnyj",
        "profileUrl": "https://unsplash.com/@tonnnyj",
        "photoUrl": "https://unsplash.com/photos/a-white-shirt-hanging-on-a-clothes-line-S4f4apZd-hA"
      },
      "alt": "a white shirt hanging on a clothes line"
    },
    "overrides": {
      "name": "Linen Camp Shirt",
      "secondaryColors": []
    }
  },
  "itm_shirt_denim": {
    "photo": {
      "id": "RqYTuWkTdEs",
      "raw": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MXx8ZGVuaW0lMjBzaGlydHxlbnwxfHx8fDE3OTQ4NzUwMDh8MA&ixlib=rb-4.1.0",
      "color": "#c0c0c0",
      "credit": {
        "name": "Santhosh Kumar",
        "username": "shivsantos",
        "profileUrl": "https://unsplash.com/@shivsantos",
        "photoUrl": "https://unsplash.com/photos/blue-heart-pattern-button-down-shirt-RqYTuWkTdEs"
      },
      "alt": "A blue button-down shirt with a white heart pattern hanging on a hanger"
    },
    "overrides": {}
  },
  "itm_hood_grey": {
    "photo": {
      "id": "SbHt5T4C1Ys",
      "raw": "https://images.unsplash.com/photo-1655141559697-f927ed68170c?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8OXx8Z3JleSUyMGhvb2RpZXxlbnwxfHx8fDE3OTQ4NzUwMDh8MA&ixlib=rb-4.1.0",
      "color": "#595959",
      "credit": {
        "name": "Submersible Tees",
        "username": "submersibletees",
        "profileUrl": "https://unsplash.com/@submersibletees",
        "photoUrl": "https://unsplash.com/photos/a-black-jacket-with-a-zipper-SbHt5T4C1Ys"
      },
      "alt": "a black jacket with a zipper"
    },
    "overrides": {
      "name": "Charcoal Marl Hoodie",
      "mainColor": "charcoal"
    }
  },
  "itm_hood_black": {
    "photo": {
      "id": "dqjGsWq2cII",
      "raw": "https://images.unsplash.com/photo-1581655353466-d5ad6765dd37?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MTh8fGJsYWNrJTIwaG9vZGllfGVufDF8fHx8MTc5NDg3NTAwOXww&ixlib=rb-4.1.0",
      "color": "#262626",
      "credit": {
        "name": "Haryo Setyadi",
        "username": "uyk",
        "profileUrl": "https://unsplash.com/@uyk",
        "photoUrl": "https://unsplash.com/photos/black-and-white-textile-on-white-textile-dqjGsWq2cII"
      },
      "alt": "black and white textile on white textile"
    },
    "overrides": {}
  },
  "itm_crew_sage": {
    "photo": {
      "id": "7cERndkOyDw",
      "raw": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MXx8Y3Jld25lY2slMjBzd2VhdHNoaXJ0fGVufDF8fHx8MTc5NDg3NTAwOXww&ixlib=rb-4.1.0",
      "color": "#f3f3f3",
      "credit": {
        "name": "Mediamodifier",
        "username": "mediamodifier",
        "profileUrl": "https://unsplash.com/@mediamodifier",
        "photoUrl": "https://unsplash.com/photos/white-crew-neck-long-sleeve-shirt-7cERndkOyDw"
      },
      "alt": "white crew neck long sleeve shirt"
    },
    "overrides": {
      "name": "Off-White Crewneck",
      "mainColor": "ecru",
      "pattern": "solid"
    }
  },
  "itm_crew_navy": {
    "photo": {
      "id": "iN-Zmxm46Oo",
      "raw": "https://images.unsplash.com/photo-1607160199580-1b0c9b736b66?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8N3x8Y3Jld25lY2slMjBzd2VhdHNoaXJ0fGVufDF8fHx8MTc5NDg3NTAwOXww&ixlib=rb-4.1.0",
      "color": "#d9d9d9",
      "credit": {
        "name": "Meghna R",
        "username": "darkandflawed",
        "profileUrl": "https://unsplash.com/@darkandflawed",
        "photoUrl": "https://unsplash.com/photos/brown-crew-neck-shirt-on-white-table-iN-Zmxm46Oo"
      },
      "alt": "brown crew neck shirt on white table"
    },
    "overrides": {
      "name": "Rust Crewneck",
      "mainColor": "rust",
      "secondaryColors": [],
      "pattern": "solid"
    }
  },
  "itm_zip_olive": {
    "photo": {
      "id": "gJtwWqMiyUw",
      "raw": "https://images.unsplash.com/photo-1649937408746-4d2f603f91c8?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MXx8ZmxlZWNlJTIwamFja2V0fGVufDF8fHx8MTc5NDg3NTAxMHww&ixlib=rb-4.1.0",
      "color": "#404059",
      "credit": {
        "name": "Nikola Tasic",
        "username": "tasae34",
        "profileUrl": "https://unsplash.com/@tasae34",
        "photoUrl": "https://unsplash.com/photos/a-brown-jacket-hanging-on-a-wooden-wall-gJtwWqMiyUw"
      },
      "alt": "a brown jacket hanging on a wooden wall"
    },
    "overrides": {
      "name": "Vintage Fleece Jacket",
      "mainColor": "brown",
      "secondaryColors": [
        "orange"
      ]
    }
  },
  "itm_jkt_bomber": {
    "photo": {
      "id": "TcRaVI3LXds",
      "raw": "https://images.unsplash.com/photo-1624548140129-74786c5f1279?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8Mnx8Ym9tYmVyJTIwamFja2V0fGVufDF8fHx8MTc5NDg3NTAxMHww&ixlib=rb-4.1.0",
      "color": "#d9d9d9",
      "credit": {
        "name": "Bulbul Ahmed",
        "username": "bulbul252",
        "profileUrl": "https://unsplash.com/@bulbul252",
        "photoUrl": "https://unsplash.com/photos/blue-zip-up-hoodie-jacket-TcRaVI3LXds"
      },
      "alt": "blue zip up hoodie jacket"
    },
    "overrides": {
      "name": "Navy Bomber Jacket",
      "mainColor": "navy",
      "secondaryColors": [
        "ecru"
      ]
    }
  },
  "itm_jkt_trucker": {
    "photo": {
      "id": "QRN47la37gw",
      "raw": "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MXx8ZGVuaW0lMjBqYWNrZXR8ZW58MXx8fHwxNzk0ODc1MDExfDA&ixlib=rb-4.1.0",
      "color": "#262640",
      "credit": {
        "name": "Caio Coelho",
        "username": "smokthebikini",
        "profileUrl": "https://unsplash.com/@smokthebikini",
        "photoUrl": "https://unsplash.com/photos/blue-denim-button-up-jacket-QRN47la37gw"
      },
      "alt": "blue denim button up jacket"
    },
    "overrides": {
      "name": "Rinse Denim Trucker",
      "mainColor": "denim",
      "secondaryColors": [
        "brown"
      ],
      "pattern": "solid"
    }
  },
  "itm_jeans_raw": {
    "photo": {
      "id": "9yoXrG6Er_g",
      "raw": "https://images.unsplash.com/photo-1714143136372-ddaf8b606da7?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8Mnx8amVhbnMlMjBmbGF0JTIwbGF5fGVufDF8fHx8MTc5NDg3NTAxMnww&ixlib=rb-4.1.0",
      "color": "#d9d9d9",
      "credit": {
        "name": "TuanAnh Blue",
        "username": "blueeyeaa",
        "profileUrl": "https://unsplash.com/@blueeyeaa",
        "photoUrl": "https://unsplash.com/photos/a-pair-of-blue-jeans-on-a-white-background-9yoXrG6Er_g"
      },
      "alt": "a pair of blue jeans on a white background"
    },
    "overrides": {}
  },
  "itm_jeans_light": {
    "photo": {
      "id": "KVHIG5biScQ",
      "raw": "https://images.unsplash.com/photo-1721637296276-3816701ae7cf?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MTd8fGplYW5zJTIwZmxhdCUyMGxheXxlbnwxfHx8fDE3OTQ4NzUwMTJ8MA&ixlib=rb-4.1.0",
      "color": "#f3f3f3",
      "credit": {
        "name": "TuanAnh Blue",
        "username": "blueeyeaa",
        "profileUrl": "https://unsplash.com/@blueeyeaa",
        "photoUrl": "https://unsplash.com/photos/a-pair-of-jeans-sitting-on-top-of-each-other-KVHIG5biScQ"
      },
      "alt": "A pair of jeans sitting on top of each other"
    },
    "overrides": {}
  },
  "itm_jeans_black": {
    "photo": {
      "id": "h6PKsr0wDH4",
      "raw": "https://images.unsplash.com/photo-1718252540511-e958742e4165?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MTF8fGplYW5zJTIwZmxhdCUyMGxheXxlbnwxfHx8fDE3OTQ4NzUwMTJ8MA&ixlib=rb-4.1.0",
      "color": "#d9d9d9",
      "credit": {
        "name": "TuanAnh Blue",
        "username": "blueeyeaa",
        "profileUrl": "https://unsplash.com/@blueeyeaa",
        "photoUrl": "https://unsplash.com/photos/a-pair-of-black-jeans-sitting-on-top-of-a-white-floor-h6PKsr0wDH4"
      },
      "alt": "a pair of black jeans sitting on top of a white floor"
    },
    "overrides": {}
  },
  "itm_chino_stone": {
    "photo": {
      "id": "lBi04ECUJfw",
      "raw": "https://images.unsplash.com/photo-1711443813147-def27861b9af?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MTN8fGJlaWdlJTIwY2hpbm8lMjBwYW50c3xlbnwxfHx8fDE3OTQ4NzUwMTN8MA&ixlib=rb-4.1.0",
      "color": "#a6a6a6",
      "credit": {
        "name": "saeed karimi",
        "username": "saeedkarimistudio",
        "profileUrl": "https://unsplash.com/@saeedkarimistudio",
        "photoUrl": "https://unsplash.com/photos/a-pair-of-glasses-a-book-and-a-pair-of-pants-on-a-table-lBi04ECUJfw"
      },
      "alt": "a pair of glasses, a book, and a pair of pants on a table"
    },
    "overrides": {
      "mainColor": "beige"
    }
  },
  "itm_trouser_black": {
    "photo": {
      "id": "h6PKsr0wDH4",
      "raw": "https://images.unsplash.com/photo-1718252540511-e958742e4165?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MXx8YmxhY2slMjB0cm91c2Vyc3xlbnwxfHx8fDE3OTQ4NzUwMTR8MA&ixlib=rb-4.1.0",
      "color": "#d9d9d9",
      "credit": {
        "name": "TuanAnh Blue",
        "username": "blueeyeaa",
        "profileUrl": "https://unsplash.com/@blueeyeaa",
        "photoUrl": "https://unsplash.com/photos/a-pair-of-black-jeans-sitting-on-top-of-a-white-floor-h6PKsr0wDH4"
      },
      "alt": "a pair of black jeans sitting on top of a white floor"
    },
    "overrides": {}
  },
  "itm_short_denim": {
    "photo": {
      "id": "Hd4nlxLgIbA",
      "raw": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MXx8c2hvcnRzJTIwZmxhdCUyMGxheXxlbnwxfHx8fDE3OTQ4NzUwMTV8MA&ixlib=rb-4.1.0",
      "color": "#f3f3f3",
      "credit": {
        "name": "engin akyurt",
        "username": "enginakyurt",
        "profileUrl": "https://unsplash.com/@enginakyurt",
        "photoUrl": "https://unsplash.com/photos/blue-denim-shorts-on-white-surface-Hd4nlxLgIbA"
      },
      "alt": "blue denim shorts on white surface"
    },
    "overrides": {}
  },
  "itm_shoe_white": {
    "photo": {
      "id": "-YE65Y0kgws",
      "raw": "https://images.unsplash.com/photo-1722489291778-cb2a414d6ee0?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8Nnx8d2hpdGUlMjBsZWF0aGVyJTIwc25lYWtlcnN8ZW58MXx8fHwxNzk0ODc1MDE2fDA&ixlib=rb-4.1.0",
      "color": "#f3f3f3",
      "credit": {
        "name": "SJ 📸",
        "username": "uxsj_ph",
        "profileUrl": "https://unsplash.com/@uxsj_ph",
        "photoUrl": "https://unsplash.com/photos/a-white-sneaker-with-a-green-stripe-on-the-side--YE65Y0kgws"
      },
      "alt": "A white sneaker with a green stripe on the side"
    },
    "overrides": {
      "secondaryColors": [
        "forest"
      ]
    }
  },
  "itm_shoe_retro": {
    "photo": {
      "id": "tgdgb6yb0Qo",
      "raw": "https://images.unsplash.com/photo-1621315271772-28b1f3a5df87?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8NHx8Z3JleSUyMHJ1bm5pbmclMjBzbmVha2Vyc3xlbnwxfHx8fDE3OTQ4NzUwMTZ8MA&ixlib=rb-4.1.0",
      "color": "#d9d9d9",
      "credit": {
        "name": "Ervan M Wirawan",
        "username": "ervan_me",
        "profileUrl": "https://unsplash.com/@ervan_me",
        "photoUrl": "https://unsplash.com/photos/gray-and-white-nike-athletic-shoe-tgdgb6yb0Qo"
      },
      "alt": "gray and white nike athletic shoe"
    },
    "overrides": {
      "secondaryColors": [
        "white"
      ]
    }
  },
  "itm_shoe_hightop": {
    "photo": {
      "id": "sd-VmUUrdrw",
      "raw": "https://images.unsplash.com/photo-1676379760823-ebf91f45de0b?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8M3x8YmxhY2slMjBoaWdoJTIwdG9wJTIwc25lYWtlcnN8ZW58MXx8fHwxNzk0ODc1MDE3fDA&ixlib=rb-4.1.0",
      "color": "#f3f3f3",
      "credit": {
        "name": "Maria Fernanda Pissioli",
        "username": "mxpissioli",
        "profileUrl": "https://unsplash.com/@mxpissioli",
        "photoUrl": "https://unsplash.com/photos/a-pair-of-black-and-white-sneakers-on-a-white-surface-sd-VmUUrdrw"
      },
      "alt": "a pair of black and white sneakers on a white surface"
    },
    "overrides": {}
  },
  "itm_shoe_boot": {
    "photo": {
      "id": "o1P_ylA6t3k",
      "raw": "https://images.unsplash.com/photo-1773425159034-14ae688135db?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8OXx8YnJvd24lMjBjaGVsc2VhJTIwYm9vdHN8ZW58MXx8fHwxNzk0ODc1MDE3fDA&ixlib=rb-4.1.0",
      "color": "#f3f3f3",
      "credit": {
        "name": "roberto saborizado",
        "username": "pitchu",
        "profileUrl": "https://unsplash.com/@pitchu",
        "photoUrl": "https://unsplash.com/photos/a-single-tan-leather-chelsea-boot-on-white-background-o1P_ylA6t3k"
      },
      "alt": "A single tan leather chelsea boot on white background"
    },
    "overrides": {
      "name": "Leather Chelsea Boots",
      "mainColor": "camel",
      "pattern": "solid"
    }
  },
  "itm_shoe_loafer": {
    "photo": {
      "id": "PVGwSl6Lzzs",
      "raw": "https://images.unsplash.com/photo-1784822041007-a2083ecb1b37?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8OXx8bG9hZmVycyUyMHNob2VzfGVufDF8fHx8MTc5NDg3NTAzNnww&ixlib=rb-4.1.0",
      "color": "#f3f3f3",
      "credit": {
        "name": "McFollis",
        "username": "thisismcfollis",
        "profileUrl": "https://unsplash.com/@thisismcfollis",
        "photoUrl": "https://unsplash.com/photos/a-pair-of-black-embellished-loafers-on-a-light-floor-PVGwSl6Lzzs"
      },
      "alt": "A pair of black embellished loafers on a light floor"
    },
    "overrides": {
      "name": "Woven Leather Slip-Ons"
    }
  },
  "itm_shoe_derby": {
    "photo": {
      "id": "1iQUP9axQ_Y",
      "raw": "https://images.unsplash.com/photo-1703053026570-f06f3b09a78c?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8NHx8YmxhY2slMjBsZWF0aGVyJTIwZGVyYnklMjBzaG9lc3xlbnwxfHx8fDE3OTQ4NzUwMTh8MA&ixlib=rb-4.1.0",
      "color": "#f3f3f3",
      "credit": {
        "name": "Haider Riaz",
        "username": "haider_21",
        "profileUrl": "https://unsplash.com/@haider_21",
        "photoUrl": "https://unsplash.com/photos/a-pair-of-black-shoes-on-a-white-background-1iQUP9axQ_Y"
      },
      "alt": "a pair of black shoes on a white background"
    },
    "overrides": {}
  },
  "itm_acc_tote": {
    "photo": {
      "id": "smTDI-z1rlY",
      "raw": "https://images.unsplash.com/photo-1574365569389-a10d488ca3fb?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MXx8Y2FudmFzJTIwdG90ZSUyMGJhZ3xlbnwxfHx8fDE3OTQ4NzUwMTl8MA&ixlib=rb-4.1.0",
      "color": "#8c8c8c",
      "credit": {
        "name": "Brando Makes Branding",
        "username": "brandomakesbranding",
        "profileUrl": "https://unsplash.com/@brandomakesbranding",
        "photoUrl": "https://unsplash.com/photos/white-reusable-bag-on-gray-surface-smTDI-z1rlY"
      },
      "alt": "white reusable bag on gray surface"
    },
    "overrides": {
      "secondaryColors": []
    }
  },
  "itm_acc_belt": {
    "photo": {
      "id": "rH16wMV8ImM",
      "raw": "https://images.unsplash.com/photo-1711443982852-b3df5c563448?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8NHx8bGVhdGhlciUyMGJlbHR8ZW58MXx8fHwxNzk0ODc1MDIwfDA&ixlib=rb-4.1.0",
      "color": "#c0c0c0",
      "credit": {
        "name": "saeed karimi",
        "username": "saeedkarimistudio",
        "profileUrl": "https://unsplash.com/@saeedkarimistudio",
        "photoUrl": "https://unsplash.com/photos/a-pair-of-brown-leather-belts-sitting-on-top-of-a-white-piece-of-paper-rH16wMV8ImM"
      },
      "alt": "a pair of brown leather belts sitting on top of a white piece of paper"
    },
    "overrides": {
      "name": "Braided Leather Belt",
      "mainColor": "rust"
    }
  },
  "itm_acc_sunglasses": {
    "photo": {
      "id": "K62u25Jk6vo",
      "raw": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixid=M3wxMTM2Mjc5fDB8MXxzZWFyY2h8MXx8YmxhY2slMjBzdW5nbGFzc2VzfGVufDF8fHx8MTc5NDg3NTAyMHww&ixlib=rb-4.1.0",
      "color": "#f3f3f3",
      "credit": {
        "name": "Giorgio Trovato",
        "username": "giorgiotrovato",
        "profileUrl": "https://unsplash.com/@giorgiotrovato",
        "photoUrl": "https://unsplash.com/photos/shallow-focus-photo-of-black-ray-ban-wayfarer-sunglasses-K62u25Jk6vo"
      },
      "alt": "shallow focus photo of black Ray-Ban wayfarer sunglasses"
    },
    "overrides": {}
  }
};
