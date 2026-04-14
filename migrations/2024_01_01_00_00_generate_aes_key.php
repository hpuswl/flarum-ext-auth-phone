<?php

use Illuminate\Database\Schema\Builder;
use Illuminate\Support\Str;

return [
    'up' => function (Builder $schema) {
        $keyPath = base_path('storage/key');
        $keyFile = $keyPath . '/aesKey';
        
        if (!file_exists($keyFile)) {
            if (!is_dir($keyPath)) {
                mkdir($keyPath, 0755, true);
            }
            
            $key = str_replace("-", "", Str::uuid());
            $iv = Str::random(16);
            
            file_put_contents($keyFile, json_encode([
                "key" => $key,
                "iv" => $iv,
                "desc" => "flarum phone aes encrypt"
            ], JSON_PRETTY_PRINT));
        }
    },
    'down' => function (Builder $schema) {
        // 回滚时不删除密钥
    },
];