import InsuranceProvider from '../models/InsuranceProvider.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all insurance providers
// @route   GET /api/owner/insurance-providers
// @access  Private/Owner
export const getInsuranceProviders = asyncHandler(async (req, res) => {
    const providers = await InsuranceProvider.find({})
        .sort({ name: 1 });

    res.status(200).json({
        success: true,
        data: providers
    });
});

// @desc    Get single provider
// @route   GET /api/owner/insurance-providers/:id
// @access  Private/Owner
export const getInsuranceProviderById = asyncHandler(async (req, res) => {
    const provider = await InsuranceProvider.findById(req.params.id);

    if (!provider) {
        res.status(404);
        throw new Error('Insurance Provider not found');
    }

    res.status(200).json({
        success: true,
        data: provider
    });
});

// @desc    Create provider
// @route   POST /api/owner/insurance-providers
// @access  Private/Owner
export const createInsuranceProvider = asyncHandler(async (req, res) => {
    const { name, code } = req.body;

    const providerExists = await InsuranceProvider.findOne({
        $or: [{ name }, { code }]
    });

    if (providerExists) {
        res.status(400);
        throw new Error('Insurance Provider already exists');
    }

    const provider = await InsuranceProvider.create(req.body);

    res.status(201).json({
        success: true,
        data: provider
    });
});

// @desc    Update provider
// @route   PATCH /api/owner/insurance-providers/:id
// @access  Private/Owner
export const updateInsuranceProvider = asyncHandler(async (req, res) => {
    const provider = await InsuranceProvider.findById(req.params.id);

    if (!provider) {
        res.status(404);
        throw new Error('Insurance Provider not found');
    }

    const updatedProvider = await InsuranceProvider.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: updatedProvider
    });
});

// @desc    Delete provider
// @route   DELETE /api/owner/insurance-providers/:id
// @access  Private/Owner
export const deleteInsuranceProvider = asyncHandler(async (req, res) => {
    const provider = await InsuranceProvider.findById(req.params.id);

    if (!provider) {
        res.status(404);
        throw new Error('Insurance Provider not found');
    }

    // Check if used? Usually soft delete or check dependency
    // await provider.deleteOne(); 
    // Prefer Deactivate:
    provider.isActive = false;
    await provider.save();

    res.status(200).json({
        success: true,
        message: 'Insurance Provider deactivated'
    });
});
