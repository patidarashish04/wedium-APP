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

// retrieve and return all Banner
const getBanner = async (req, res, next) => {
 
        getAllBanner()
            .then(categories => {
                res.status(200).json({
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

// retrive and return a single Banner
const FindOneBanner = async (req, res, next) => {
    const id = req.params.id;
    getBannerByid(id)
        .then(async (banner) => {
            try {
                if (!banner && banner.id) {
                    res.status(404).json({ message: "Not found banner with id " + id })
                } else {
                    res.status(200).json(banner)
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
                res.status(200).json(data)
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Error Update banner information" })
        })
}

const deleteBanner = async (req, res, next) => {
    const id = req.params.id;
    await deleteBannerByid(id)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
            } else {
                res.status(200).json({
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
