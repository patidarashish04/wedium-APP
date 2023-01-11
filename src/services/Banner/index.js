const { createBanners, getBannerByid, getAllBanner, updateBannerByid, deleteBannerByid } = require('../Banner/function')

//  create Banner
const createBanner = async (req, res, next) => {
    try {
        const body = req.body;
        // Validate Banner input
        if (!(body.imagePath)) {
            res.status(400).json("All input is required");
        }
        const Banner = await createBanners(body);
        res.status(200).json(Banner);
    } catch (err) {
        console.log(err);
    }
}

// retrieve and return all Banner/ retrive and return a single Banner
const getBanner = async (req, res, next) => {
    if (req.query.id) {
        const id = req.query.id;
        getBannerByid(id)
            .then(async (Banner) => {
                try {
                    if (!Banner && Banner.id) {
                        res.status(404).json({ message: "Not found Banner with id " + id })
                    } else {
                        res.json(Banner)
                    }
} catch (err) {
                    res.status(500).json({ message: "Error retrieving Banner with id " + id })
                }
            })
            .catch((err) => res.status(500).json(err));
    } else {
        getAllBanner()
            .then(categories => {
                res.status(201).json({
                    data: categories,
                    status: true,
                    message: null
                })
            })
            .catch(err => {
                res.status(500).json({ message: err.message || "Error Occurred while retriving Banner information" })
                next(err);
            })
    }
}
//*********************Pagination code for all data*******************************
//     limitPage = parseInt(req.query.limit, 10) || 10;
//     const pageChange = parseInt(req.query.page, 10) || 1;
//     Product.paginate({}, { limit: limitPage, page: pageChange }).populate('Banner')
//       .then((result) => {
//         return res.status(200).json({
//           message: "GET request to all getAllProducts",
//           dataCount: result.length,
//           result: result,
//         });
//       })
//       .catch((err) => {
//         console.log(err);
//         res.status(500).json({
//           error: err,
//         });
//       });
//   },


// retrive and return a single Banner
const FindOneBanner = async (req, res, next) => {
    const id = req.params.id;
    getBannerByid(id)
        .then(async (banner) => {
            try {
                if (!banner && banner.id) {
                    res.status(404).json({ message: "Not found banner with id " + id })
                } else {
                    res.json(banner)
                }
            } catch (err) {
                res.status(500).json({ message: "Error retrieving banner with id " + id })
            }
        })
        .catch((err) => res.status(500).json(err));
}

// update banner
const updateBanner = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    await updateBannerByid(id, data)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Update banner with ${id}. Maybe banner not found!` })
            } else {
                res.json(data)
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Error Update banner information" })
        })
}

const deleteBanner = async (req, res, next) => {
    const id = req.params.id;
    console.log('**********************', id)
    await deleteBannerByid(id)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
            } else {
                res.json({
                    message: "banner was deleted successfully!"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Could not delete banner with id=" + id
            });
        });createBanner
}

module.exports = {
    createBanner,
    getBanner,
    FindOneBanner,
    updateBanner,
    deleteBanner,
};
