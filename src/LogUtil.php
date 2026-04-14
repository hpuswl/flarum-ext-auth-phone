<?php

namespace Hpuswl\AuthPhone;

class LogUtil
{
    // 日志文件路径 (默认在当前目录下的 logs 文件夹)
    private static $logFile = null;

    // 日志级别常量
    const LEVEL_DEBUG = 'DEBUG';
    const LEVEL_INFO  = 'INFO';
    const LEVEL_WARN  = 'WARNING';
    const LEVEL_ERROR = 'ERROR';

    /**
     * 初始化日志文件路径
     * 如果目录不存在会自动创建
     */
    private static function init($customPath = null)
    {
        self::$logFile = __DIR__ . '/storage/logs/app.log';

        if ($customPath) {
            self::$logFile = $customPath;
        }

        // 检查目录是否存在，不存在则创建 (Windows 权限友好)
        $dir = dirname(self::$logFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
    }

    /**
     * 核心写入方法
     * @param string $level 日志级别
     * @param string $message 消息
     * @param mixed $context 上下文数据 (数组或对象)
     */
    private static function write($level, $message, $context = [])
    {
        self::init();

        // 1. 格式化时间
        $time = date('Y-m-d H:i:s');

        // 2. 处理上下文数据 (如果是数组或对象，转为 JSON 字符串)
        $contextStr = '';
        if (!empty($context)) {
            // 解决中文乱码问题
            $contextStr = ' | Context: ' . json_encode($context, JSON_UNESCAPED_UNICODE);
        }

        // 3. 拼接日志内容
        // 格式：[2023-10-27 12:00:00] [LEVEL] Message | Context...
        $logContent = "[$time] [$level] $message$contextStr" . PHP_EOL;

        // 4. 写入文件 (使用 FILE_APPEND 追加模式 和 LOCK_EX 文件锁)
        // 文件锁非常重要，防止并发请求导致日志写入冲突
        file_put_contents(self::$logFile, $logContent, FILE_APPEND | LOCK_EX);
    }

    // --- 快捷方法 ---

    public static function debug($msg, $ctx = []) {
        self::write(self::LEVEL_DEBUG, $msg, $ctx);
    }

    public static function info($msg, $ctx = []) {
        self::write(self::LEVEL_INFO, $msg, $ctx);
    }

    public static function warning($msg, $ctx = []) {
        self::write(self::LEVEL_WARN, $msg, $ctx);
    }

    public static function error($msg, $ctx = []) {
        self::write(self::LEVEL_ERROR, $msg, $ctx);
    }

    /**
     * 专门用于打印变量结构 (类似 var_dump 但写入文件)
     */
    public static function dump($var, $label = 'Dump') {
        self::write(self::LEVEL_DEBUG, "=== $label ===", $var);
    }

}
