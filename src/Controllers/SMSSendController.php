<?php
namespace Hpuswl\AuthPhone\Controllers;

use Flarum\Http\RequestUtil;
use Hpuswl\AuthPhone\SMS\SMSManager;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class SMSSendController implements RequestHandlerInterface
{
    protected $sms;

    public function __construct(SMSManager $sms)
    {
        $this->sms = $sms;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $actor = RequestUtil::getActor($request);
        // 如果用户已登录且已绑定手机，则直接返回错误
        if($actor->id !== 0 && $actor->phone){
            $translator = resolve(TranslatorInterface::class);
            return new JsonResponse( ["status"=>false, "msg" => $translator->trans('hpuswl-auth-phone.forum.alerts.already_linked')]);
        }
        $ip = $request->getAttribute('ipAddress');
        return new JsonResponse( $this->sms->driver()->send( $request->getParsedBody(), $actor->id, $ip) );
    }
}
