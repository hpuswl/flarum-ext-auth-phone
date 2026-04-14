<?php

use Illuminate\Database\Schema\Builder;
use Hpuswl\AuthPhone\KeyDisk;

return [
    'up' => function (Builder $schema) {
        $disk = resolve(KeyDisk::class);
        if (!$disk->exists()) {
            $disk->store();
        }
    },
    'down' => function (Builder $schema) {
        // 回滚时不删除密钥
    },
];