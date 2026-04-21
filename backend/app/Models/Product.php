<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
    'vendor_id',
    'store_id',
    'name',
    'description',
    'category',
    'sku',
    'price',
    'stock_quantity',
    'image',
    'status',
    'moderation_status',
    'moderation_reason',
    'expires_at'
];

protected $casts = [
    'expires_at' => 'datetime',
];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}